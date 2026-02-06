using AutoRia.Data.Entities.Identity;

namespace AutoRia.Services.Interfaces;

public interface IJwtTokenService
{
    Task<string> CreateTokenAsync(UserEntity user);
}
