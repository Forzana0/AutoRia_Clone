using AutoRia.Data;
using AutoRia.Data.Entities;
using AutoRia.Data.Entities.Identity;
using AutoRia.ViewModels.Review;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRia.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly CarDbContext _context;
    private readonly UserManager<UserEntity> _userManager;

    public ReviewsController(CarDbContext context, UserManager<UserEntity> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET api/Reviews/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserReviews(int userId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ToUserId == userId)
            .OrderByDescending(r => r.DateCreated)
            .Select(r => new
            {
                r.Id,
                r.FromUserId,
                r.ToUserId,
                r.Stars,
                r.Comment,
                r.DateCreated,
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // POST api/Reviews/add
    [HttpPost("add")]
    public async Task<IActionResult> AddReview([FromBody] AddReviewVm model)
    {
        if (model.Stars < 1 || model.Stars > 5)
            return BadRequest("Оцінка має бути від 1 до 5");

        if (model.FromUserId == model.ToUserId)
            return BadRequest("Не можна залишати відгук собі");

        // Перевіряємо чи вже залишав відгук
        var existing = await _context.Reviews
            .FirstOrDefaultAsync(r => r.FromUserId == model.FromUserId && r.ToUserId == model.ToUserId);

        if (existing != null)
        {
            // Оновлюємо існуючий відгук
            existing.Stars = model.Stars;
            existing.Comment = model.Comment;
            existing.DateCreated = DateTime.UtcNow;
        }
        else
        {
            var review = new ReviewEntity
            {
                FromUserId = model.FromUserId,
                ToUserId = model.ToUserId,
                Stars = model.Stars,
                Comment = model.Comment,
                DateCreated = DateTime.UtcNow,
            };
            await _context.Reviews.AddAsync(review);
        }

        await _context.SaveChangesAsync();

        // Перераховуємо рейтинг користувача
        await RecalculateRatingAsync(model.ToUserId);

        return Ok(new { message = "Відгук збережено" });
    }

    private async Task RecalculateRatingAsync(int userId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ToUserId == userId)
            .ToListAsync();

        if (reviews.Count == 0) return;

        var avg = reviews.Average(r => r.Stars);
        var rounded = Math.Round(avg, 1);

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user != null)
        {
            user.Rating = rounded.ToString();
            await _userManager.UpdateAsync(user);
        }
    }
}
