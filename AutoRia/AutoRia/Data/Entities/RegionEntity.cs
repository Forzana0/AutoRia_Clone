using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoRia.Data.Entities;

[Table("tblRegions")]
public class RegionEntity : BaseEntity 
{
    [StringLength(255), Required]
    public string Name { get; set; } = null!;

    public ICollection<CityEntity> Cities { get; set; } = new List<CityEntity>();
}
