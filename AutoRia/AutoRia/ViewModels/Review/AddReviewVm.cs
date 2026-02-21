using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace AutoRia.ViewModels.Review;

public class AddReviewVm
{
    public int FromUserId { get; set; }
    public int ToUserId { get; set; }
    public int Stars { get; set; }
    public string? Comment { get; set; }
}
