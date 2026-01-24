using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoRia.Data.Entities;

[Table("tblCities")]
public class CityEntity : BaseEntity
{
    [StringLength(255), Required]
    public string Name { get; set; } = null!;

    [ForeignKey(nameof(Region))]
    public int RegionId { get; set; }

    public RegionEntity Region { get; set; } = null!;
}
