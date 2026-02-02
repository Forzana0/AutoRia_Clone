using AutoRia.Data.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoRia.Data.Entities
{
    [Table("tbl_colors")]
    public class ColorEntity : BaseEntity
    {
        public string Color { get; set; } = null!;
    }
}
