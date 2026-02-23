using AutoRia.Data.Entities.Identity;
using AutoRia.Services.Interfaces;
using AutoRia.ViewModels.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoRia.Constants;
using AutoRia.Data;
using AutoRia.SearchReauestClasses;
using AutoRia.Services;
using AutoRia.Services.ControllerServices.Interfaces;

namespace AutoRia.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IJwtTokenService jwtTokenService;
        private readonly IAccountsControllerService service;
        private readonly UserManager<UserEntity> userManager;
        private readonly SignInManager<UserEntity> signInManager;
        private readonly CarDbContext context;
        private readonly IImageService imageService;

        public AccountsController(
            IJwtTokenService jwtTokenService,
            IAccountsControllerService service,
            CarDbContext context,
            SignInManager<UserEntity> signInManager,
            IImageService imageService,
            UserManager<UserEntity> userManager)
        {
            this.jwtTokenService = jwtTokenService;
            this.service = service;
            this.userManager = userManager;
            this.context = context;
            this.imageService = imageService;
            this.signInManager = signInManager;
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await service.SignOutAsync();
            return Ok("Успішний вихід");
        }

        [HttpPost]
        public async Task<IActionResult> SignIn([FromBody] SignInVm model)
        {
            UserEntity? user = await userManager.FindByEmailAsync(model.Email);

            if (user is null || !await userManager.CheckPasswordAsync(user, model.Password))
                return Unauthorized("Невірні дані");

            var token = await jwtTokenService.CreateTokenAsync(user);
            await userManager.SetAuthenticationTokenAsync(user, "JWT", "AccessToken", token);

            return Ok(new JwtTokenResponse { Token = token });
        }

        [HttpPost]
        public async Task<IActionResult> Registration([FromForm] RegisterVm vm)
        {
            try
            {
                var user = await service.SignUpAsync(vm);
                var token = await jwtTokenService.CreateTokenAsync(user);
                await userManager.SetAuthenticationTokenAsync(user, "JWT", "AccessToken", token);

                return Ok(new JwtTokenResponse { Token = token });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { Message = "Registration failed: Missing required fields.", Details = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred during user registration.", Details = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = userManager.Users.ToList();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User not found." });

            return Ok(user);
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { Message = "User not found." });

            return Ok(user);
        }

        [HttpPost("update-profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(string userId, [FromForm] UpdateUserProfileModel model)
        {
            if (model == null)
                return BadRequest("Дані профілю не можуть бути порожніми");

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("Користувач не знайдений");

            user.FirstName = model.FirstName ?? user.FirstName;
            user.MiddleName = model.MiddleName ?? user.MiddleName;
            user.LastName = model.LastName ?? user.LastName;
            user.Description = model.Description ?? user.Description;

            var cityEntity = await context.Cities
                .Include(c => c.Region)
                .FirstOrDefaultAsync(c => c.Name == model.City);

            if (cityEntity != null)
            {
                user.City = cityEntity.Name;
                user.Region = cityEntity.Region.Name;
            }
            else
            {
                user.City = "Вказано не вірно";
                user.Region = "Вказано не вірно";
            }

            // Нове фото
            if (model.Photo != null)
                user.Photo = await imageService.SaveImageAsync(model.Photo);

            // Видалення фото
            if (model.DeletePhoto == true)
                user.Photo = null;

            user.Email = model.Email ?? user.Email;
            user.PhoneNumber = model.PhoneNumber ?? user.PhoneNumber;
            user.UserName = model.UserName ?? user.UserName;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (signInManager != null)
                await signInManager.RefreshSignInAsync(user);

            return Ok("Профіль успішно оновлено");
        }

        [HttpPut("update-password/{id}")]
        public async Task<IActionResult> UpdatePassword(string id, [FromBody] UpdatePasswordModel model)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("Користувача не знайдено");

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var resetPasswordResult = await userManager.ResetPasswordAsync(user, token, model.NewPassword);

            if (!resetPasswordResult.Succeeded)
                return BadRequest(resetPasswordResult.Errors);

            return Ok("Пароль успішно оновлено");
        }

        // DELETE: api/Accounts/DeleteAccount/{userId}
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteAccount(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("Користувача не знайдено");

            try
            {
                var userIdInt = int.Parse(userId);

                // 1. Всі CarId цього користувача
                var userCarIds = await context.UserCars
                    .Where(uc => uc.UserId == userIdInt)
                    .Select(uc => uc.CarId)
                    .ToListAsync();

                if (userCarIds.Any())
                {
                    // 2. Видаляємо фото авто з диску
                    var photos = await context.CarPhotos
                        .Where(p => userCarIds.Contains(p.CarId))
                        .ToListAsync();
                    foreach (var photo in photos)
                        imageService.DeleteImageIfExists(photo.Name);
                    context.CarPhotos.RemoveRange(photos);

                    // 3. Видаляємо UserCars
                    var userCars = await context.UserCars
                        .Where(uc => uc.UserId == userIdInt)
                        .ToListAsync();
                    context.UserCars.RemoveRange(userCars);

                    // 4. Видаляємо самі авто
                    var cars = await context.Cars
                        .Where(c => userCarIds.Contains(c.Id))
                        .ToListAsync();
                    context.Cars.RemoveRange(cars);
                }

                // 5. Видаляємо відгуки
                var reviews = await context.Reviews
                    .Where(r => r.FromUserId == userIdInt || r.ToUserId == userIdInt)
                    .ToListAsync();
                context.Reviews.RemoveRange(reviews);

                await context.SaveChangesAsync();

                // 6. Фото профілю
                if (!string.IsNullOrEmpty(user.Photo))
                    imageService.DeleteImageIfExists(user.Photo);

                // 7. Видаляємо користувача через Identity
                var result = await userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                return Ok("Акаунт успішно видалено");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Помилка при видаленні акаунту", Details = ex.Message });
            }
        }
    }
}
