using AutoMapper;
using AutoRia.ViewModels.BodyType;
using AutoRia.ViewModels.EngineVolume;
using AutoRia.ViewModels.FuelTypeVm;
using AutoRia.ViewModels.NumberOfSeats;
using AutoRia.ViewModels.TransmissionType;
using AutoRia.ViewModels.TransportType;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoRia.Data;
using AutoRia.ViewModels.Brand;

namespace AutoRia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicalSpecificationsController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly CarDbContext _context;

        public TechnicalSpecificationsController(IMapper mapper, CarDbContext context)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpGet("bodytypes")]
        public async Task<ActionResult<IEnumerable<BodyTypeVm>>> GetBodyTypes()
        {
            var bodyTypes = await _context.BodyTypes.OrderBy(b => b.Name).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<BodyTypeVm>>(bodyTypes));
        }

        [HttpGet("fueltypes")]
        public async Task<ActionResult<IEnumerable<FuelTypeVm>>> GetFuelTypes()
        {
            var fuelTypes = await _context.FuelTypes.OrderBy(f => f.Name).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<FuelTypeVm>>(fuelTypes));
        }

        [HttpGet("enginevolumes")]
        public async Task<ActionResult<IEnumerable<EngineVolumeVm>>> GetEngineVolumes()
        {
            var engineVolumes = await _context.EngineVolumes.OrderBy(e => e.Volume).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<EngineVolumeVm>>(engineVolumes));
        }

        [HttpGet("numberofseats")]
        public async Task<ActionResult<IEnumerable<NumberOfSeatsVm>>> GetNumberOfSeats()
        {
            var numberOfSeats = await _context.numbersOfSeats.OrderBy(n => n.Number).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<NumberOfSeatsVm>>(numberOfSeats));
        }

        [HttpGet("transmissiontypes")]
        public async Task<ActionResult<IEnumerable<TransmissionTypeVm>>> GetTransmissionTypes()
        {
            var transmissionTypes = await _context.TransmissionTypes.OrderBy(t => t.Name).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<TransmissionTypeVm>>(transmissionTypes));
        }

        [HttpGet("brandsandmodels")]
        public async Task<ActionResult<IEnumerable<CarBrandVm>>> GetCarBrands()
        {
            var carBrands = await _context.Brands
                .Include(cb => cb.Models.OrderBy(m => m.Name)) // моделі сортуємо за алфавітом
                .OrderBy(b => b.Name)                          // бренди теж за алфавітом
                .ToListAsync();
            return Ok(_mapper.Map<IEnumerable<CarBrandVm>>(carBrands));
        }

        [HttpGet("transporttypes")]
        public async Task<ActionResult<IEnumerable<TransportTypeVm>>> GetTransportTypes()
        {
            var carTypes = await _context.TransportTypes.OrderBy(t => t.Name).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<TransportTypeVm>>(carTypes));
        }
    }
}
