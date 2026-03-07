using AutoRia.Data;
using AutoRia.Data.Entities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AutoRia.Hubs
{
    public class ChatHub : Hub
    {
        private readonly CarDbContext _context;

        public ChatHub(CarDbContext context)
        {
            _context = context;
        }

        // Кожен юзер приєднується до своєї особистої групи по userId
        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
            if (!string.IsNullOrEmpty(userId))
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            await base.OnConnectedAsync();
        }

        // Відправити повідомлення
        public async Task SendMessage(int fromUserId, int toUserId, string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return;

            var message = new ChatMessageEntity
            {
                FromUserId = fromUserId,
                ToUserId = toUserId,
                Text = text.Trim(),
                SentAt = DateTime.UtcNow,
                IsRead = false,
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            var payload = new
            {
                id = message.Id,
                fromUserId = message.FromUserId,
                toUserId = message.ToUserId,
                text = message.Text,
                sentAt = message.SentAt,
                isRead = message.IsRead,
            };

            // Надіслати обом учасникам
            await Clients.Group($"user_{fromUserId}").SendAsync("ReceiveMessage", payload);
            await Clients.Group($"user_{toUserId}").SendAsync("ReceiveMessage", payload);
        }

        // Позначити повідомлення як прочитані
        public async Task MarkAsRead(int fromUserId, int toUserId)
        {
            var unread = await _context.ChatMessages
                .Where(m => m.FromUserId == fromUserId && m.ToUserId == toUserId && !m.IsRead)
                .ToListAsync();

            foreach (var m in unread) m.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }
}
