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

    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> GetPostById(int id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null) return NotFound();
        return post;
    }
}
