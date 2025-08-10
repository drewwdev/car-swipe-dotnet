public class SaleDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int SellerId { get; set; }
    public int BuyerId { get; set; }
    public decimal Price { get; set; }
    public DateTime SoldAt { get; set; }
    public int? ChatId { get; set; }
}
