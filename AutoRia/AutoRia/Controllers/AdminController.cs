using AutoRia.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRia.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly CarDbContext _context;

        public AdminController(CarDbContext context)
        {
            _context = context;
        }

        // ── STATS ──────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetStats()
        {
            var usersCount = await _context.Users.CountAsync();
            var carsCount = await _context.Cars.CountAsync();
            var messagesCount = await _context.ChatMessages.CountAsync();
            var favoritesCount = await _context.UserFavorites.CountAsync();

            return Ok(new { usersCount, carsCount, messagesCount, favoritesCount });
        }

        // ── USERS ──────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.UserName,
                    u.Email,
                    u.PhoneNumber,
                    u.Photo,
                    u.Rating,
                    u.City,
                    u.Region,
                    CarsCount = _context.UserCars.Count(uc => uc.UserId == u.Id),
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Видаляємо оголошення юзера
            var userCars = await _context.UserCars
                .Where(uc => uc.UserId == userId)
                .ToListAsync();

            var carIds = userCars.Select(uc => uc.CarId).ToList();
            var cars = await _context.Cars
                .Include(c => c.Photos)
                .Where(c => carIds.Contains(c.Id))
                .ToListAsync();

            _context.Cars.RemoveRange(cars);
            _context.UserCars.RemoveRange(userCars);

            // Видаляємо повідомлення
            var messages = await _context.ChatMessages
                .Where(m => m.FromUserId == userId || m.ToUserId == userId)
                .ToListAsync();
            _context.ChatMessages.RemoveRange(messages);

            // Видаляємо улюблені
            var favorites = await _context.UserFavorites
                .Where(f => f.UserId == userId)
                .ToListAsync();
            _context.UserFavorites.RemoveRange(favorites);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // ── CARS ──────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetCars()
        {
            var cars = await _context.Cars
                .Include(c => c.CarBrand)
                .Include(c => c.CarModel)
                .Include(c => c.Photos)
                .Include(c => c.City)
                .Select(c => new
                {
                    c.Id,
                    Brand = c.CarBrand != null ? c.CarBrand.Name : "",
                    Model = c.CarModel != null ? c.CarModel.Name : "",
                    c.Year,
                    c.Price,
                    c.Mileage,
                    c.DateCreated,
                    City = c.City != null ? c.City.Name : "",
                    Photo = c.Photos != null && c.Photos.Count > 0 ? c.Photos.FirstOrDefault().Name : null,
                    OwnerId = _context.UserCars
                        .Where(uc => uc.CarId == c.Id)
                        .Select(uc => uc.UserId)
                        .FirstOrDefault(),
                    OwnerName = _context.UserCars
                        .Where(uc => uc.CarId == c.Id)
                        .Select(uc => uc.User.FirstName + " " + uc.User.LastName)
                        .FirstOrDefault(),
                })
                .ToListAsync();

            return Ok(cars);
        }

        [HttpDelete("{carId}")]
        public async Task<IActionResult> DeleteCar(int carId)
        {
            var car = await _context.Cars
                .Include(c => c.Photos)
                .FirstOrDefaultAsync(c => c.Id == carId);

            if (car == null) return NotFound();

            var userCars = await _context.UserCars.Where(uc => uc.CarId == carId).ToListAsync();
            _context.UserCars.RemoveRange(userCars);

            var favorites = await _context.UserFavorites.Where(f => f.CarId == carId).ToListAsync();
            _context.UserFavorites.RemoveRange(favorites);

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPatch("{carId}")]
        public async Task<IActionResult> UpdateCarPrice(int carId, [FromBody] UpdatePriceDto dto)
        {
            var car = await _context.Cars.FindAsync(carId);
            if (car == null) return NotFound();

            car.Price = dto.Price;
            await _context.SaveChangesAsync();

            return Ok();
        }

        public class UpdatePriceDto
        {
            public decimal Price { get; set; }
        }
    }
}