using AutoRia.Services.ControllerServices.Interfaces;
using AutoRia.ViewModels.Account;
using Microsoft.AspNetCore.Mvc;

namespace AutoRia.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly IAccountsControllerService _accountsService;

    public AccountsController(IAccountsControllerService accountsService)
    {
        _accountsService = accountsService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterVm model)
    {
        var result = await _accountsService.RegisterAsync(model);
        return Ok(result);
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(int userId, string token)
    {
        var result = await _accountsService.ConfirmEmailAsync(userId, token);
        return Ok(result);
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInVm model)
    {
        try
        {
            var result = await _accountsService.SignInAsync(model);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}