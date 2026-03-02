using AutoRia.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRia.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly CarDbContext _context;

        public ChatController(CarDbContext context)
        {
            _context = context;
        }

        // Отримати всі повідомлення між двома юзерами
        [HttpGet("{userId1}/{userId2}")]
        public async Task<IActionResult> GetHistory(int userId1, int userId2)
        {
            var messages = await _context.ChatMessages
                .Where(m =>
                    (m.FromUserId == userId1 && m.ToUserId == userId2) ||
                    (m.FromUserId == userId2 && m.ToUserId == userId1))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.FromUserId,
                    m.ToUserId,
                    m.Text,
                    m.SentAt,
                    m.IsRead,
                })
                .ToListAsync();

            return Ok(messages);
        }

        // Список всіх розмов юзера (останнє повідомлення з кожним)
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetConversations(int userId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.FromUserId == userId || m.ToUserId == userId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            // Групуємо по співрозмовнику
            var conversations = messages
                .GroupBy(m => m.FromUserId == userId ? m.ToUserId : m.FromUserId)
                .Select(g =>
                {
                    var sorted = g.OrderByDescending(m => m.SentAt).ToList();
                    return new
                    {
                        WithUserId = g.Key,
                        LastMessage = sorted.First().Text,
                        LastTime = sorted.First().SentAt,
                        UnreadCount = g.Count(m => m.ToUserId == userId && !m.IsRead),
                    };
                })
                .ToList();

            // Підтягуємо інфо про співрозмовників
            var userIds = conversations.Select(c => c.WithUserId).ToList();
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Photo })
                .ToListAsync();

            var result = conversations.Select(c =>
            {
                var user = users.FirstOrDefault(u => u.Id == c.WithUserId);
                return new
                {
                    c.WithUserId,
                    Name = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Користувач",
                    Photo = user?.Photo,
                    c.LastMessage,
                    c.LastTime,
                    c.UnreadCount,
                };
            });

            return Ok(result);
        }

        // Позначити як прочитані
        [HttpPost("{fromUserId}/{toUserId}")]
        public async Task<IActionResult> MarkRead(int fromUserId, int toUserId)
        {
            var unread = await _context.ChatMessages
                .Where(m => m.FromUserId == fromUserId && m.ToUserId == toUserId && !m.IsRead)
                .ToListAsync();
            foreach (var m in unread) m.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}