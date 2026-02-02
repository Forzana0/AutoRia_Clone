using AutoRia.Data.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoRia.Data.Entities
{
    [Table("tbl_numbers_of_seats")]
    public class NumberOfSeatsEntity : BaseEntity
    {
        public int Number { get; set; }
        public string SeatType { get; set; } = "Standard";
    }
}
