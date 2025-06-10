public enum SwipeDirection {
    Left,   // Dislike
    Right   // Like (Triggers chat)
}

public class Swipe {
    public int Id { get; set; }
    public int BuyerId { get; set; }      // FK → User
    public int PostId { get; set; }       // FK → Post
    public SwipeDirection Direction { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
