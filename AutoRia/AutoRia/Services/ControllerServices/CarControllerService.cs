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
                .Include(c => c.Photos)
                .FirstOrDefaultAsync(c => c.Id == vm.Id);

            if (car == null)
                throw new Exception("Car not found");

            // ── Основні поля ──────────────────────────────────────────
            if (!string.IsNullOrWhiteSpace(vm.Stage))
                car.Stage = vm.Stage;

            if (!string.IsNullOrWhiteSpace(vm.Description))
                car.Description = vm.Description;

            if (!string.IsNullOrWhiteSpace(vm.Vin))
                car.VIN = vm.Vin;

            if (vm.Year > 0)
                car.Year = vm.Year;

            if (vm.Mileage > 0)
                car.Mileage = vm.Mileage;

            if (vm.Price > 0)
                car.Price = vm.Price;

            // ── Зв'язані сутності ─────────────────────────────────────
            if (!string.IsNullOrWhiteSpace(vm.CarBrand))
                car.CarBrand = await _carContext.Brands
                    .FirstOrDefaultAsync(b => b.Name == vm.CarBrand);

            if (!string.IsNullOrWhiteSpace(vm.CarModel))
                car.CarModel = await _carContext.Models
                    .FirstOrDefaultAsync(m => m.Name == vm.CarModel);

            if (!string.IsNullOrWhiteSpace(vm.BodyType))
                car.BodyType = await _carContext.BodyTypes
                    .FirstOrDefaultAsync(bt => bt.Name == vm.BodyType);

            if (!string.IsNullOrWhiteSpace(vm.TransportType))
                car.TransportType = await _carContext.TransportTypes
                    .FirstOrDefaultAsync(tt => tt.Name == vm.TransportType);

            if (!string.IsNullOrWhiteSpace(vm.TransmissionType))
                car.TransmissionType = await _carContext.TransmissionTypes
                    .FirstOrDefaultAsync(tt => tt.Name == vm.TransmissionType);

            if (!string.IsNullOrWhiteSpace(vm.FuelTypes))
                car.FuelTypes = await _carContext.FuelTypes
                    .FirstOrDefaultAsync(ft => ft.Name == vm.FuelTypes);

            if (!string.IsNullOrWhiteSpace(vm.City))
                car.City = await _carContext.Cities
                    .FirstOrDefaultAsync(c => c.Name == vm.City);

            if (!string.IsNullOrWhiteSpace(vm.EngineVolume) &&
                float.TryParse(vm.EngineVolume, System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out float engVol))
            {
                car.EngineVolume = await _carContext.EngineVolumes
                    .FirstOrDefaultAsync(ev => ev.Volume == engVol);
            }

            // ── Видалення зазначених фото ─────────────────────────────
            if (vm.DeletedPhotos != null && vm.DeletedPhotos.Any())
            {
                var toDelete = car.Photos
                    .Where(p => vm.DeletedPhotos.Contains(p.Name))
                    .ToList();

                foreach (var photo in toDelete)
                {
                    _imageService.DeleteImageIfExists(photo.Name);
                    car.Photos.Remove(photo);
                    _carContext.CarPhotos.Remove(photo);
                }
            }

            // ── Додавання нових фото ───────────────────────────────────
            if (vm.Photos != null && vm.Photos.Any())
            {
                var maxPriority = car.Photos.Any()
                    ? car.Photos.Max(p => p.Priority)
                    : 0;

                foreach (var photo in vm.Photos)
                {
                    maxPriority++;
                    car.Photos.Add(new CarPhotoEntity
                    {
                        Name = await _imageService.SaveImageAsync(photo),
                        Priority = maxPriority
                    });
                }
            }

            _carContext.Cars.Update(car);
            await _carContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<CarVm>> SearchAsync(CarSearchRequest searchRequest)
        {
            IQueryable<CarEntity> query = _carContext.Cars.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchRequest.SelectedBrand) &&
                searchRequest.SelectedBrand != "Будь-який")
            {
                query = query.Where(c => c.CarBrand != null && c.CarBrand.Name == searchRequest.SelectedBrand);
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.SelectedModel) &&
                searchRequest.SelectedModel != "Будь-який")
            {
                query = query.Where(c => c.CarModel != null && c.CarModel.Name == searchRequest.SelectedModel);
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.CarType) &&
                searchRequest.CarType != "Будь-який")
            {
                query = query.Where(c => c.TransportType != null && c.TransportType.Name == searchRequest.CarType);
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.Year) &&
                searchRequest.Year != "Будь-який" &&
                int.TryParse(searchRequest.Year, out int year))
            {
                query = query.Where(c => c.Year == year);
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.Region) &&
                searchRequest.Region != "Будь-який")
            {
                query = query.Where(c =>
                    (c.City != null && c.City.Name == searchRequest.Region) ||
                    (c.City != null && c.City.Region != null && c.City.Region.Name == searchRequest.Region));
            }

            if (!string.IsNullOrWhiteSpace(searchRequest.SearchType) &&
                searchRequest.SearchType != "Будь-який" &&
                searchRequest.SearchType != "Всі")
            {
                query = query.Where(c => c.Stage == searchRequest.SearchType);
            }

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

            if (searchRequest.VinChecked)
            {
                query = query.Where(c => !string.IsNullOrEmpty(c.VIN));
            }

            // Debug — виведи в консоль що фільтрується
            Console.WriteLine($"[Search] Brand={searchRequest.SelectedBrand}, SearchType={searchRequest.SearchType}, Year={searchRequest.Year}, Region={searchRequest.Region}");

            var cars = await query
                .ProjectTo<CarVm>(_mapper.ConfigurationProvider)
                .ToListAsync();

            // Сортуємо фото за Priority після отримання даних з БД
            foreach (var car in cars)
                if (car.Photos != null)
                    car.Photos = car.Photos.OrderBy(p => p.Priority).ToList();

            return cars;
        }
    }
}