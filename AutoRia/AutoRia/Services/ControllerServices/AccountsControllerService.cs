using System.Text;
using AutoRia.Data.Entities.Identity;
using AutoRia.Services.ControllerServices.Interfaces;
using AutoRia.Services.Interfaces;
using AutoRia.ViewModels.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;

namespace AutoRia.Services.ControllerServices;

public class AccountsControllerService : IAccountsControllerService
{
    private readonly UserManager<UserEntity> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AccountsControllerService(
        UserManager<UserEntity> userManager,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<object> RegisterAsync(RegisterVm model)
    {
        var user = new UserEntity
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            DateCreated = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            return new { success = false, errors = result.Errors };
        }

        await _userManager.AddToRoleAsync(user, "User");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        Console.WriteLine("==========================================");
        Console.WriteLine($"User registered: {user.Email}");
        Console.WriteLine($"Confirmation token (для Swagger / локального тесту): {encodedToken}");
        Console.WriteLine("==========================================");
        Console.WriteLine($"UserId: {user.Id}");


        var request = _httpContextAccessor.HttpContext!.Request;
        var confirmationLink = $"{request.Scheme}://{request.Host}/api/accounts/confirm-email?userId={user.Id}&token={encodedToken}";

        await _emailService.SendEmailAsync(
            user.Email!,
            "Підтвердження реєстрації AutoRia",
            $"<h2>Вітаємо на AutoRia!</h2><p>Натисніть на посилання для підтвердження:</p><a href='{confirmationLink}'>Підтвердити Email</a>"
        );

        return new { success = true, message = "Реєстрація успішна! Перевірте пошту." };
    }

    public async Task<object> ConfirmEmailAsync(int userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return new { success = false, message = "Користувача не знайдено" };

        var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (result.Succeeded)
            return new { success = true, message = "Email підтверджено!" };

        return new { success = false, message = "Помилка підтвердження" };
    }

    public async Task<JwtTokenResponse> SignInAsync(SignInVm model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
            throw new UnauthorizedAccessException("Невірний email або пароль");

        if (!await _userManager.IsEmailConfirmedAsync(user))
            throw new UnauthorizedAccessException("Email не підтверджено");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Невірний email або пароль");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user, roles);

        return new JwtTokenResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? ""
        };
    }
}