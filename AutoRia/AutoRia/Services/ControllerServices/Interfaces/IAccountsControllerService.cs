using AutoRia.Data.Entities.Identity;
using AutoRia.ViewModels.Account;
using AutoRia.Data.Entities.Identity;
using AutoRia.ViewModels.Account;

namespace WebBack.Services.ControllerServices.Interfaces
{
    public interface IAccountsControllerService
    {
        Task<UserEntity> SignUpAsync(RegisterVm vm);
        Task SignOutAsync();
    }
}
