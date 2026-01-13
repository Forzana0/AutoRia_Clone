using AutoRia.ViewModels.Account;

namespace AutoRia.Services.ControllerServices.Interfaces;

public interface IAccountsControllerService
{
    Task<object> RegisterAsync(RegisterVm model);
    Task<object> ConfirmEmailAsync(int userId, string token);
    Task<JwtTokenResponse> SignInAsync(SignInVm model);
}