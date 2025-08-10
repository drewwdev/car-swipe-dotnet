using car_swipe_dotnet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _context;
    public StatsController(AppDbContext context) { _context = context; }

    [HttpGet("overview")]
    public async Task<ActionResult<StatsOverviewDto>> GetOverview()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var cashEarned = await _context.Sales
            .Where(s => s.SellerId == userId)
            .SumAsync(s => (decimal?)s.Amount) ?? 0m;

        var cashSpent = await _context.Sales
            .Where(s => s.BuyerId == userId)
            .SumAsync(s => (decimal?)s.Amount) ?? 0m;


        var myPosts        = await _context.Posts.CountAsync(p => p.UserId == userId);
        var carsSold       = await _context.Posts.CountAsync(p => p.UserId == userId && p.Status == PostStatus.Sold);
        var likedByMe      = await _context.Swipes.CountAsync(s => s.BuyerId == userId && s.Direction == SwipeDirection.Right);
        var dislikedByMe   = await _context.Swipes.CountAsync(s => s.BuyerId == userId && s.Direction == SwipeDirection.Left);
        var likedByOthers  = await _context.Swipes
                                .Where(s => s.Direction == SwipeDirection.Right)
                                .Join(_context.Posts, s => s.PostId, p => p.Id, (s, p) => new { s, p })
                                .CountAsync(x => x.p.UserId == userId);
        var activeChats    = await _context.Chats.CountAsync(c => c.BuyerId == userId || c.SellerId == userId);

        int carsBought = 0;

        try
        {
            carsBought  = await _context.Sales.CountAsync(s => s.BuyerId == userId);
            cashSpent   = await _context.Sales.Where(s => s.BuyerId == userId).SumAsync(s => (decimal?)s.Amount) ?? 0m;
            cashEarned  = await _context.Sales.Where(s => s.SellerId == userId).SumAsync(s => (decimal?)s.Amount) ?? 0m;
        }
        catch
        {
            // Sales table not ready? Keep zeros.
        }

        return new StatsOverviewDto
        {
            MyPosts = myPosts,
            CarsSold = carsSold,
            CarsBought = carsBought,
            LikedByMe = likedByMe,
            DislikedByMe = dislikedByMe,
            LikedByOthers = likedByOthers,
            CashEarned = cashEarned,
            CashSpent = cashSpent,
            ActiveChats = activeChats
        };
    }

    [HttpGet("activity-basic")]
    public async Task<ActionResult<IEnumerable<ActivityItemDto>>> GetActivityBasic([FromQuery] int limit = 20)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        limit = Math.Clamp(limit, 1, 100);

        var recentPosts = await _context.Posts
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit)
            .Select(p => new ActivityItemDto
            {
                CreatedAt = p.CreatedAt,
                Type = "PostCreated",
                Summary = $"Listed: {p.Title}",
                PostId = p.Id
            })
            .ToListAsync();

        var recentSales = await _context.Sales
            .Where(s => s.SellerId == userId || s.BuyerId == userId)
            .OrderByDescending(s => s.ClosedAt)
            .Take(limit)
            .Select(s => new ActivityItemDto
            {
                CreatedAt = s.ClosedAt,
                Type = s.SellerId == userId ? "SaleClosedAsSeller" : "SaleClosedAsBuyer",
                Summary = $"Sale closed for Post #{s.PostId} at ${s.Amount}",
                PostId = s.PostId,
                SaleId = s.Id
            })
            .ToListAsync();

        var recentSwipesOnMyPosts = await _context.Swipes
            .Where(sw => sw.Direction == SwipeDirection.Right && sw.Post.UserId == userId)
            .OrderByDescending(sw => sw.Id)
            .Take(limit)
            .Select(sw => new ActivityItemDto
            {
                CreatedAt = sw.Post.CreatedAt,
                Type = "SwipeReceived",
                Summary = $"Your post \"{sw.Post.Title}\" received a like",
                PostId = sw.PostId
            })
            .ToListAsync();

        var recentMessages = await _context.Messages
            .Where(m => m.SenderId == userId || m.Chat.BuyerId == userId || m.Chat.SellerId == userId)
            .OrderByDescending(m => m.SentAt)
            .Take(limit)
            .Select(m => new ActivityItemDto
            {
                CreatedAt = m.SentAt,
                Type = m.SenderId == userId ? "MessageSent" : "MessageReceived",
                Summary = m.Text.Length > 60 ? m.Text.Substring(0, 60) + "…" : m.Text,
                ChatId = m.ChatId
            })
            .ToListAsync();

        var all = recentPosts.Concat(recentSales).Concat(recentSwipesOnMyPosts).Concat(recentMessages)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToList();

        return all;
    }
}
