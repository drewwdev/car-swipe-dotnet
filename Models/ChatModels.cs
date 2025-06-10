public class Chat {
    public int Id { get; set; }
    public int BuyerId { get; set; }   // FK → User
    public int SellerId { get; set; }  // FK → User
    public int PostId { get; set; }    // FK → Post
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public required List<Message> Messages { get; set; } = new();
}

public class Message {
    public int Id { get; set; }
    public int ChatId { get; set; }     // FK → Chat
    public int SenderId { get; set; }   // FK → User
    public required string Text { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
