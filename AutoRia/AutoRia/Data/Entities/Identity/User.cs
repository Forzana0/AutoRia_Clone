using Microsoft.AspNetCore.Identity;
namespace AutoRia.Data.Entities.Identity;
public class UserEntity : IdentityUser<int>
{
    public string FirstName { get; set; } = null!;
    public string MiddleName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Region { get; set; } = null!;
    public string? City { get; set; } = null!;
    public string? Rating { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string? Description { get; set; }
    // Зв'язок з власними автомобілями
    public virtual ICollection<UserCarEntity> Cars { get; set; } = new List<UserCarEntity>();
    public string? Photo { get; set; } = null!;
    public virtual ICollection<UserRoleEntity> UserRoles { get; set; } = null!;
}
