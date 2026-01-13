using Microsoft.AspNetCore.Identity;

namespace AutoRia.Data.Entities.Identity;

public class RoleEntity : IdentityRole<int>
{
    public RoleEntity() { }

    public RoleEntity(string name) { Name = name; }

    public ICollection<UserRoleEntity> UserRoles { get; set; } = null!;
}
