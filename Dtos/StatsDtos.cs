public class StatsOverviewDto
{
    public int MyPosts { get; set; }
    public int CarsSold { get; set; }
    public int CarsBought { get; set; }
    public int LikedByMe { get; set; }
    public int DislikedByMe { get; set; }
    public int LikedByOthers { get; set; }
    public decimal CashEarned { get; set; }
    public decimal CashSpent { get; set; }
    public int ActiveChats { get; set; }
}

public class ActivityItemDto
{
    public DateTime CreatedAt { get; set; }
    public string Type { get; set; } = "";
    public string Summary { get; set; } = "";
    public int? PostId { get; set; }
    public int? ChatId { get; set; }
    public int? SaleId { get; set; }
}
