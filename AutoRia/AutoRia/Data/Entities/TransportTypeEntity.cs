using AutoRia.Data.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoRia.Data.Entities
{
    [Table("tbl_transport_types")]
    public class TransportTypeEntity : BaseEntity
    {
        [StringLength(255), Required]
        public string Name { get; set; } = null!;
    }
}
