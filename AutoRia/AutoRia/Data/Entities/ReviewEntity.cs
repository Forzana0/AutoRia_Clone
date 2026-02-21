namespace AutoRia.Data.Entities;

public class ReviewEntity
{
    public int Id { get; set; }
    public int FromUserId { get; set; }
    public int ToUserId { get; set; }
    public int Stars { get; set; }
    public string? Comment { get; set; }
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
}
