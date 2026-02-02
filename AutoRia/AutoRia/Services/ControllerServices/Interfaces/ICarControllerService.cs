
using AutoRia.ViewModels.Car;
using AutoRia.SearchReauestClasses;
using AutoRia.ViewModels;
using AutoRia.ViewModels.Car;

namespace WebBack.Services.ControllerServices.Interfaces
{
    public interface ICarControllerService
    {
        Task CreateAsync(CarCreateVm vm);
        Task UpdateAsync(CarEditVm vm);
        Task<IEnumerable<CarVm>> SearchAsync(CarSearchRequest? searchRequest);
        // Task DeleteIfExistsAsync(int id);
    }
}