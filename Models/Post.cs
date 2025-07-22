namespace car_swipe_dotnet.Models;

public enum PostStatus
{
    Active,
    Sold
}

public class Post
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }
    public int Mileage { get; set; }

    public decimal Price { get; set; }
    public string Location { get; set; } = string.Empty;

    public List<string> ImageUrls { get; set; } = new();

    public PostStatus Status { get; set; } = PostStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
