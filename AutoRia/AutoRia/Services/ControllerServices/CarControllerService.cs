using AutoMapper;
using AutoMapper.QueryableExtensions;
using AutoRia.Data.Entities;
using AutoRia.Data.Entities.Identity;
using AutoRia.ViewModels.Car;
using Microsoft.EntityFrameworkCore;
using AutoRia.Data;
using AutoRia.SearchReauestClasses;
using AutoRia.Services.ControllerServices.Interfaces;
using AutoRia.Services.Interfaces;
using AutoRia.ViewModels;

namespace AutoRia.Services.ControllerServices
{
    public class CarControllerService : ICarControllerService
    {
        private readonly CarDbContext _carContext;
        private readonly IMapper _mapper;
        private readonly IImageService _imageService;

        public CarControllerService(
            CarDbContext carContext,
            IMapper mapper,
            IImageService imageService)
        {
            _carContext = carContext ?? throw new ArgumentNullException(nameof(carContext));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _imageService = imageService ?? throw new ArgumentNullException(nameof(imageService));
        }

        public async Task CreateAsync(CarCreateVm vm)
        {
            var car = new CarEntity();
            car.DateCreated = DateTime.UtcNow;
            int priorityIndex = 1;

            if (vm.Photos != null && vm.Photos.Any())
            {
                car.Photos = new List<CarPhotoEntity>();
                foreach (var photo in vm.Photos)
                {
                    car.Photos.Add(new CarPhotoEntity
                    {
                        Name = await _imageService.SaveImageAsync(photo),
                        Priority = priorityIndex
                    });
                    priorityIndex++;
                }
            }

            car.BodyType = await _carContext.BodyTypes.Where(bt => bt.Name == vm.BodyType).FirstOrDefaultAsync();
            car.CarModel = await _carContext.Models.Where(m => m.Name == vm.CarModel).FirstOrDefaultAsync();
            car.CarBrand = await _carContext.Brands.Where(b => b.Name == vm.CarBrand).FirstOrDefaultAsync();
            car.City = await _carContext.Cities.Where(c => c.Name == vm.City).FirstOrDefaultAsync();
            car.Color = await _carContext.Colors.Where(cl => cl.Color == vm.Color).FirstOrDefaultAsync();
            car.Description = vm.Description;
            car.EngineVolume = await _carContext.EngineVolumes.Where(ev => ev.Volume == float.Parse(vm.EngineVolume)).FirstOrDefaultAsync();
            car.FuelTypes = await _carContext.FuelTypes.Where(ft => ft.Name == vm.FuelTypes).FirstOrDefaultAsync();
            car.NumberOfSeats = await _carContext.numbersOfSeats.Where(ns => ns.Number == int.Parse(vm.NumberOfSeats)).FirstOrDefaultAsync();
            car.Stage = vm.Stage;
            car.TransportType = await _carContext.TransportTypes.Where(tt => tt.Name == vm.TransportType).FirstOrDefaultAsync();
            car.VIN = vm.Vin;
            car.TransmissionType = await _carContext.TransmissionTypes.Where(tt => tt.Name == vm.TransmissionType).FirstOrDefaultAsync();
            car.HasAirConditioning = vm.HasAirConditioning;
            car.HasHeadlights = vm.HasHeadlights;
            car.HasHeatedSeats = vm.HasHeatedSeats;
            car.HasHeightAdjustableSeats = vm.HasHeightAdjustableSeats;
            car.HasLeatherInterior = vm.HasLeatherInterior;
            car.HasPowerSteering = vm.HasPowerSteering;
            car.HasPowerWindows = vm.HasPowerWindows;
            car.HasPremiumInteriorColor = vm.HasPremiumInteriorColor;
            car.HasSeatMemory = vm.HasSeatMemory;
            car.HasSeatVentilation = vm.HasSeatVentilation;
            car.HasSpareWheel = vm.HasSpareWheel;
            car.IsBargainAvailable = vm.IsBargainAvailable;
            car.IsExchangeAvailable = vm.IsExchangeAvailable;
            car.IsInstallmentAvailable = vm.IsInstallmentAvailable;
            car.IsNotCustomsCleared = vm.IsNotCustomsCleared;
            car.Metallic = vm.Metallic;
            car.Price = vm.Price;
            car.Year = vm.Year;
            car.Mileage = vm.Mileage;

            try
            {
                await _carContext.Cars.AddAsync(car);
                await _carContext.SaveChangesAsync();

                var userCar = new UserCarEntity
                {
                    User = await _carContext.Users.Where(u => u.Id == int.Parse(vm.UserId)).FirstOrDefaultAsync(),
                    UserId = int.Parse(vm.UserId),
                    Car = car,
                    CarId = car.Id
                };

                if (userCar != null)
                {
                    await _carContext.UserCars.AddAsync(userCar);
                    await _carContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating car: " + ex.Message);
            }
        }

        public async Task UpdateAsync(CarEditVm vm)
        {
            var car = await _carContext.Cars
                .Include(x => x.Photos)
                .FirstOrDefaultAsync(c => c.Id == vm.Id);

            if (car == null)
                throw new Exception("Car not found");

            _mapper.Map(vm, car);

            _carContext.Cars.Update(car);
            await _carContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<CarVm>> SearchAsync(CarSearchRequest searchRequest)
        {
            IQueryable<CarEntity> query = _carContext.Cars;

            // Фільтрація за брендом
            if (!string.IsNullOrWhiteSpace(searchRequest.SelectedBrand) &&
                searchRequest.SelectedBrand != "Будь-який")
            {
                query = query.Where(c => c.CarBrand.Name == searchRequest.SelectedBrand);
            }

            // Фільтрація за моделлю
            if (!string.IsNullOrWhiteSpace(searchRequest.SelectedModel) &&
                searchRequest.SelectedModel != "Будь-який")
            {
                query = query.Where(c => c.CarModel.Name == searchRequest.SelectedModel);
            }

            // Фільтрація за типом транспорту
            if (!string.IsNullOrWhiteSpace(searchRequest.CarType) &&
                searchRequest.CarType != "Будь-який")
            {
                query = query.Where(c => c.TransportType.Name == searchRequest.CarType);
            }

            // Фільтрація за роком
            if (!string.IsNullOrWhiteSpace(searchRequest.Year) &&
                searchRequest.Year != "Будь-який" &&
                int.TryParse(searchRequest.Year, out int year))
            {
                query = query.Where(c => c.Year == year);
            }

            // Фільтрація за регіоном / містом
            if (!string.IsNullOrWhiteSpace(searchRequest.Region) &&
                searchRequest.Region != "Будь-який")
            {
                query = query.Where(c =>
                    c.City.Name == searchRequest.Region ||
                    c.City.Region.Name == searchRequest.Region);
            }

            // Фільтрація за станом (Новий / Вживаний)
            if (!string.IsNullOrWhiteSpace(searchRequest.SearchType) &&
                searchRequest.SearchType != "Будь-який" &&
                searchRequest.SearchType != "Всі")
            {
                query = query.Where(c => c.Stage == searchRequest.SearchType);
            }

            // Фільтрація за ціною — формат "5000-20000"
            if (!string.IsNullOrWhiteSpace(searchRequest.Price) &&
                searchRequest.Price != "Будь-який")
            {
                var parts = searchRequest.Price.Split('-');
                if (parts.Length == 2)
                {
                    if (decimal.TryParse(parts[0], out decimal priceFrom) && priceFrom > 0)
                        query = query.Where(c => c.Price >= priceFrom);

                    if (decimal.TryParse(parts[1], out decimal priceTo) && priceTo > 0 && priceTo < 999999)
                        query = query.Where(c => c.Price <= priceTo);
                }
            }

            // Фільтрація за VIN
            if (searchRequest.VinChecked)
            {
                query = query.Where(c => !string.IsNullOrEmpty(c.VIN));
            }

            return await query
                .ProjectTo<CarVm>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }
    }
}
