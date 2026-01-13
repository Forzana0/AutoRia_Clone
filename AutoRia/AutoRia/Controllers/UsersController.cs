using AutoRia.Data.Context;
using AutoRia.Data.Entities.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRia.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbAutoRiaContext _context;

        public UsersController(AppDbAutoRiaContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();

            var result = users.Select(u => new UserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Image = u.Image,
                DateCreated = u.DateCreated,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
            }).ToList();

            return Ok(result);
        }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Image { get; set; }
        public DateTime DateCreated { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}
