using car_swipe_dotnet.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] Post post)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        post.UserId = userId;

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Post>>> GetAllPosts()
    {
        return await _context.Posts
            .Where(p => p.Status == PostStatus.Active)
            .ToListAsync();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<Post>>> GetMyPosts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return await _context.Posts
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    [Authorize]
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<Post>>> GetAvailablePosts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var swipedPostIds = await _context.Swipes
            .Where(s => s.BuyerId == userId)
            .Select(s => s.PostId)
            .ToListAsync();

        var posts = await _context.Posts
            .Where(p => p.Status == PostStatus.Active &&
                        p.UserId != userId &&
                        !swipedPostIds.Contains(p.Id))
            .ToListAsync();

        return posts;
    }

    [Authorize]
    [HttpGet("liked")]
    public async Task<ActionResult<IEnumerable<Post>>> GetMyLikedPosts()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var likedPostIds = await _context.Swipes
            .Where(s => s.Direction == SwipeDirection.Right && s.Post.UserId == userId)
            .Select(s => s.PostId)
            .Distinct()
            .ToListAsync();

        var likedPosts = await _context.Posts
            .Where(p => likedPostIds.Contains(p.Id))
            .ToListAsync();

        return likedPosts;
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> GetPostById(int id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null) return NotFound();
        return post;
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var post = await _context.Posts.FindAsync(id);
        if (post == null || post.UserId != userId)
        {
            return NotFound();
        }

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var post = await _context.Posts.FindAsync(id);
        if (post == null) return NotFound();
        if (post.UserId != userId) return Forbid();

        post.Title = dto.Title;
        post.Description = dto.Description;
        post.Price = dto.Price;
        post.Mileage = dto.Mileage;
        post.ImageUrls = dto.ImageUrls;
        post.Location = dto.Location;
        post.Year = dto.Year;

        await _context.SaveChangesAsync();
        return Ok(post);
    }

    [Authorize]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await using var tx = await _context.Database.BeginTransactionAsync();

        var post = await _context.Posts.FindAsync(id);
        if (post == null) return NotFound();
        if (post.UserId != userId) return Forbid();

        var newStatus = dto.Status == "Sold" ? PostStatus.Sold : PostStatus.Active;

        var existingSale = await _context.Sales.SingleOrDefaultAsync(s => s.PostId == id);

        if (post.Status == newStatus)
        {
            return Ok(post);
        }

        post.Status = newStatus;
        _context.Posts.Update(post);

        if (newStatus == PostStatus.Sold)
        {
            if (existingSale == null)
            {
                var sale = new Sale
                {
                    PostId = id,
                    SellerId = post.UserId,
                    BuyerId  = dto.BuyerId,
                    Amount   = post.Price,
                    CreatedAt = DateTime.UtcNow,
                    ClosedAt  = DateTime.UtcNow
                };
                _context.Sales.Add(sale);
            }
            else
            {
                existingSale.Amount = post.Price;
                if (existingSale.BuyerId == null && dto.BuyerId != null)
                    existingSale.BuyerId = dto.BuyerId;
                _context.Sales.Update(existingSale);
            }
        }
        else
        {
            if (existingSale != null)
            {
                _context.Sales.Remove(existingSale);
            }
        }

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(post);
    }

}
