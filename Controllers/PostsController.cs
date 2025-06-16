using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Seller,Both")]
    [HttpPost]
    public async Task<IActionResult> CreatePost(Post post)
    {
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

    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> GetPostById(int id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null) return NotFound();
        return post;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Post>>> GetPostsByUser(int userId)
    {
        return await _context.Posts
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }
}
