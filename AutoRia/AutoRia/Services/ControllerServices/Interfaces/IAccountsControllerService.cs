using AutoRia.Data.Entities.Identity;
using AutoRia.ViewModels.Account;

namespace AutoRia.Services.ControllerServices.Interfaces
{
    public interface IAccountsControllerService
    {
        Task<UserEntity> SignUpAsync(RegisterVm vm);
        Task SignOutAsync();
    }
}
