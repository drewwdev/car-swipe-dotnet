using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace car_swipe_dotnet.Models;

public enum SwipeDirection
{
    Left,   // 0
    Right   // 1
}

public class Swipe
{
    public int Id { get; set; }

    public int BuyerId { get; set; }

    [BindNever]
    [ValidateNever]
    [JsonIgnore]
    public virtual User Buyer { get; set; } = null!;

    public int PostId { get; set; }

    [BindNever]
    [ValidateNever]
    [JsonIgnore]
    public virtual Post Post { get; set; } = null!;

    public SwipeDirection Direction { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
