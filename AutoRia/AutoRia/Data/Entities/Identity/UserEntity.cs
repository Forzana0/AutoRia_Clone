using Microsoft.AspNetCore.Identity;

namespace AutoRia.Data.Entities.Identity;

public class UserEntity : IdentityUser<int>
{
    public string? FirstName { get; set; } = null;
    public string? LastName { get; set; } = null;
    public string? Image { get; set; } = null;
    public DateTime DateCreated { get; set; } = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
    public ICollection<UserRoleEntity> UserRoles { get; set; } = null!;
}
