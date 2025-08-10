public class UpdatePostDto
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public int Mileage { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string Location { get; set; } = "";
    public int Year { get; set; }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = "Available"; // or "Sold"
}
