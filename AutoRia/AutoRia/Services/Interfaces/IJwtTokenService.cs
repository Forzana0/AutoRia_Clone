using AutoRia.Data.Entities.Identity;

namespace AutoRia.Services.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(UserEntity user, IList<string> roles);
}