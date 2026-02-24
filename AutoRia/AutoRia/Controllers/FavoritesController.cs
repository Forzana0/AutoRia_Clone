using AutoMapper;
using AutoMapper.QueryableExtensions;
using AutoRia.Data;
using AutoRia.Data.Entities.Identity;
using AutoRia.ViewModels.Car;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly CarDbContext _context;
        private readonly IMapper _mapper;

        public FavoritesController(CarDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst("id");
            if (claim == null) return 0;
            return int.TryParse(claim.Value, out int id) ? id : 0;
        }

        // GET: api/Favorites — всі улюблені поточного юзера
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            // Один JOIN запит замість двох окремих
            var cars = await _context.UserFavorites
                .Where(uf => uf.UserId == userId)
                .Select(uf => uf.Car)
                .ProjectTo<CarVm>(_mapper.ConfigurationProvider)
                .ToListAsync();

            foreach (var car in cars)
                if (car.Photos != null)
                    car.Photos = car.Photos.OrderBy(p => p.Priority).ToList();

            return Ok(cars);
        }

        // GET: api/Favorites/ids — лише масив id
        [HttpGet("ids")]
        public async Task<IActionResult> GetFavoriteIds()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var ids = await _context.UserFavorites
                .Where(uf => uf.UserId == userId)
                .Select(uf => uf.CarId)
                .ToListAsync();

            return Ok(ids);
        }

        // POST: api/Favorites/{carId}
        [HttpPost("{carId}")]
        public async Task<IActionResult> AddFavorite(int carId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var exists = await _context.UserFavorites
                .AnyAsync(uf => uf.UserId == userId && uf.CarId == carId);

            if (exists) return Ok();

            var car = await _context.Cars.FindAsync(carId);
            if (car == null) return NotFound();

            await _context.UserFavorites.AddAsync(new UserFavoriteEntity
            {
                UserId = userId,
                CarId = carId,
            });
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/Favorites/{carId}
        [HttpDelete("{carId}")]
        public async Task<IActionResult> RemoveFavorite(int carId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var favorite = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.CarId == carId);

            if (favorite == null) return NotFound();

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}