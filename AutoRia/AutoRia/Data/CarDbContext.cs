using AutoRia.Data.Entities;
using AutoRia.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace AutoRia.Data
{
    public class CarDbContext : IdentityDbContext<UserEntity, RoleEntity, int,
        IdentityUserClaim<int>, UserRoleEntity, IdentityUserLogin<int>,
        IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public CarDbContext(DbContextOptions<CarDbContext> options) : base(options) { }
        public DbSet<CarEntity> Cars { get; set; }
        public DbSet<BodyTypeEntity> BodyTypes { get; set; }
        public DbSet<CarBrandEntity> Brands { get; set; }
        public DbSet<CarModelEntity> Models { get; set; }
        public DbSet<ColorEntity> Colors { get; set; }
        public DbSet<EngineVolumeEntity> EngineVolumes { get; set; }
        public DbSet<FuelTypesEntity> FuelTypes { get; set; }
        public DbSet<NumberOfSeatsEntity> numbersOfSeats { get; set; }
        public DbSet<TransmissionTypeEntity> TransmissionTypes { get; set; }
        public DbSet<TransportTypeEntity> TransportTypes { get; set; }
        public DbSet<CarPhotoEntity> CarPhotos { get; set; } = null!;
        public DbSet<UserCarEntity> UserCars { get; set; } = null!;
        public DbSet<RegionEntity> Regions { get; set; }
        public DbSet<CityEntity> Cities { get; set; }
        public DbSet<ReviewEntity> Reviews { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserRoleEntity>(ur =>
            {
                ur.HasKey(ur => new { ur.UserId, ur.RoleId });
                ur.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(r => r.RoleId)
                    .IsRequired();
                ur.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(u => u.UserId)
                    .IsRequired();
            });

            modelBuilder.Entity<UserCarEntity>()
                .HasKey(uc => new { uc.UserId, uc.CarId });
            modelBuilder.Entity<UserCarEntity>()
                .HasOne(uc => uc.User)
                    .WithMany(u => u.Cars)
                    .HasForeignKey(uc => uc.UserId)
                    .IsRequired();
            modelBuilder.Entity<UserCarEntity>()
                .HasOne(uc => uc.Car)
                .WithMany(c => c.UserCars)
                .HasForeignKey(uc => uc.CarId);

            modelBuilder.Entity<CityEntity>()
                .HasOne(c => c.Region)
                .WithMany(r => r.Cities)
                .HasForeignKey(c => c.RegionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Reviews — no FK constraints to AspNetUsers to avoid cascade issues
            modelBuilder.Entity<ReviewEntity>(r =>
            {
                r.HasKey(r => r.Id);
                r.Property(r => r.Stars).IsRequired();
                r.Property(r => r.DateCreated).IsRequired();
            });
        }
    }
}
