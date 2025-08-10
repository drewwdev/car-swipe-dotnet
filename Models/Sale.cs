namespace car_swipe_dotnet.Models;

public class Sale
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int SellerId { get; set; }
    public int BuyerId { get; set; }
    public decimal Amount { get; set; }
    public DateTime ClosedAt { get; set; } = DateTime.UtcNow;

    public virtual Post Post { get; set; } = null!;
}
