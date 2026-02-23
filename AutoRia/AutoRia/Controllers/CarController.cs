using AutoMapper;
using AutoMapper.QueryableExtensions;
using AutoRia.ViewModels.Account;
using AutoRia.ViewModels.Car;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoRia.Data;
using AutoRia.SearchReauestClasses;
using AutoRia.Services.ControllerServices.Interfaces;
using AutoRia.ViewModels;

namespace WebBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly CarDbContext _context;
        private readonly ICarControllerService _service;

        public CarController(
            IMapper mapper,
            CarDbContext context,
            ICarControllerService service)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // POST: api/Car/search
        [HttpPost("search")]
        public async Task<IActionResult> SearchCars([FromBody] CarSearchRequest searchRequest)
        {
            if (searchRequest == null)
                return BadRequest("Invalid search request.");

            try
            {
                var cars = await _service.SearchAsync(searchRequest);
                return Ok(cars);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Car
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarVm>>> GetCars()
        {
            var cars = await _context.Cars
                .ProjectTo<CarVm>(_mapper.ConfigurationProvider)
                .ToArrayAsync();
            return Ok(cars);
        }

        // GET: api/Car/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CarVm>> GetCar(int id)
        {
            var carUser = await _context.UserCars
                .Where(uc => uc.CarId == id)
                .FirstOrDefaultAsync();

            var car = await _context.Cars
                .Where(c => c.Id == id)
                .ProjectTo<CarVm>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (car == null)
                return NotFound();

            if (carUser != null)
            {
                car.user = _context.Users
                    .Where(u => u.Id == carUser.UserId)
                    .ProjectTo<ProfileVm>(_mapper.ConfigurationProvider)
                    .FirstOrDefault();
            }

            return Ok(car);
        }

        // POST: api/Car/add
        [HttpPost("add")]
        public async Task<IActionResult> Create([FromForm] CarCreateVm vm)
        {
            try
            {
                await _service.CreateAsync(vm);
                return Ok(new { message = "Car created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the car.", details = ex.Message });
            }
        }

        // PUT: api/Car/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CarEditVm vm)
        {
            vm.Id = id; // прив'язуємо id з URL до моделі

            try
            {
                await _service.UpdateAsync(vm);
                return Ok(new { message = "Car updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/Car/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCar(int id)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null)
                return NotFound();

            _context.Cars.Remove(car);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Car/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<CarVm>>> GetCarsByUserId(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound($"User with ID {userId} not found.");

            var userCarIds = await _context.UserCars
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.CarId)
                .ToListAsync();

            var cars = await _context.Cars
                .Where(c => userCarIds.Contains(c.Id))
                .ProjectTo<CarVm>(_mapper.ConfigurationProvider)
                .ToArrayAsync();

            return Ok(cars);
        }

        private bool CarExists(int id)
        {
            return _context.Cars.Any(e => e.Id == id);
        }
    }
}
