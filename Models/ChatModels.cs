using car_swipe_dotnet.Models;

public class Chat
{
    public int Id { get; set; }

    public int BuyerId { get; set; }
    public virtual User Buyer { get; set; } = null!;

    public int SellerId { get; set; }
    public virtual User Seller { get; set; } = null!;

    public int PostId { get; set; }
    public virtual Post Post { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual List<Message> Messages { get; set; } = new();
}

public class Message
{
    public int Id { get; set; }

    public int ChatId { get; set; }
    public virtual Chat Chat { get; set; } = null!;

    public int SenderId { get; set; }
    public virtual User Sender { get; set; } = null!;

    public string Text { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
