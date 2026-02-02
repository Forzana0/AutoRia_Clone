using Microsoft.AspNetCore.Identity;

namespace AutoRia.Data.Entities.Identity;

public class RoleEntity : IdentityRole<int>
{
    public virtual ICollection<UserRoleEntity> UserRoles { get; set; } = null!;
}