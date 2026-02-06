using AutoRia.Data.Entities;
using AutoRia.Data.Entities.Identity;

namespace AutoRia.Data.Entities.Identity
{
    public class UserCarEntity
    {
        public int? UserId { get; set; } // Зовнішній ключ для користувача
        public virtual UserEntity User { get; set; } = null!; // Навігаційна властивість

        public int CarId { get; set; } // Зовнішній ключ для автомобіля
        public virtual CarEntity Car { get; set; } = null!; // Навігаційна властивість
    }
}
