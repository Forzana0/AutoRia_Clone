using AutoMapper;
using AutoRia.ViewModels.Region_City;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoRia.Data;
using AutoRia.Data.Entities;
using AutoRia.Services.ControllerServices.Interfaces;
using AutoRia.ViewModels.Car;

namespace AutoRia.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegionalAndPricingController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly CarDbContext _context;

        public RegionalAndPricingController(
            IMapper mapper,
            CarDbContext context)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }



        [HttpGet]
        public async Task<ActionResult<IEnumerable<RegionVm>>> GetRegions()
        {
            var regions = await _context.Regions.Include(r => r.Cities).ToListAsync();

            var regionVms = _mapper.Map<IEnumerable<RegionVm>>(regions);

            return Ok(regionVms);
        }

    }
}
