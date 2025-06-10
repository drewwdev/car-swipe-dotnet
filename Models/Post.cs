public enum PostStatus { Active, Sold }
public enum VehicleCondition { New, LikeNew, Used, Salvage }

public class Post {
    public int Id { get; set; }
    public int UserId { get; set; }

    public required string Title { get; set; }
    public required string Description { get; set; }

    public required string Make { get; set; }
    public required string Model { get; set; }
    public int Year { get; set; }
    public int Mileage { get; set; }

    public VehicleCondition Condition { get; set; }
    public decimal Price { get; set; }
    public required string Location { get; set; }

    public required List<string> ImageUrls { get; set; } = new();

    public PostStatus Status { get; set; } = PostStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
