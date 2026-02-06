using AutoRia.ViewModels.Car;
using AutoRia.SearchReauestClasses;

namespace AutoRia.Services.ControllerServices.Interfaces
{
    public interface ICarControllerService
    {
        Task CreateAsync(CarCreateVm vm);
        Task UpdateAsync(CarEditVm vm);
        Task<IEnumerable<CarVm>> SearchAsync(CarSearchRequest? searchRequest);
        // Task DeleteIfExistsAsync(int id);
    }
}