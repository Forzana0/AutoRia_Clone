using AutoRia.Data.Entities.Identity;

namespace AutoRia.Data.Entities.Identity
{
    public class UserFavoriteEntity
    {
        public int UserId { get; set; }
        public virtual UserEntity User { get; set; } = null!;

        public int CarId { get; set; }
        public virtual CarEntity Car { get; set; } = null!;
    }
}
