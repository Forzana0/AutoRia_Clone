using Microsoft.AspNetCore.Http;

namespace AutoRia.ViewModels.Car
{
    public class CarEditVm
    {
        public int Id { get; set; }

        // Основне
        public string? Stage { get; set; }
        public string? Description { get; set; }
        public string? Vin { get; set; }
        public int Year { get; set; }
        public decimal Mileage { get; set; }
        public decimal Price { get; set; }

        // Зв'язані сутності (передаємо назву як рядок)
        public string? CarBrand { get; set; }
        public string? CarModel { get; set; }
        public string? BodyType { get; set; }
        public string? TransportType { get; set; }
        public string? TransmissionType { get; set; }
        public string? FuelTypes { get; set; }
        public string? EngineVolume { get; set; }
        public string? City { get; set; }

        // Нові фото для завантаження
        public List<IFormFile>? Photos { get; set; }

        // Імена існуючих фото які треба видалити
        public List<string>? DeletedPhotos { get; set; }
    }
}

