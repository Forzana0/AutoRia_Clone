using AutoRia.Data.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoRia.Data.Entities
{
    [Table("tbl_engine_volumes")]
    public class EngineVolumeEntity : BaseEntity
    {
        public float Volume { get; set; }


    }
}
