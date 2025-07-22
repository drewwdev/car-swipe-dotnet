namespace car_swipe_dotnet.Models;

public enum SwipeDirection
{
    Left,   // Dislike
    Right   // Like (Triggers chat)
}

public class Swipe
{
    public int Id { get; set; }

    public int BuyerId { get; set; }
    public virtual User Buyer { get; set; } = null!;

    public int PostId { get; set; }
    public virtual Post Post { get; set; } = null!;

    public SwipeDirection Direction { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
