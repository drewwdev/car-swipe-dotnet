using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using car_swipe_dotnet.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SwipesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SwipesController(AppDbContext context)
    {
        _context = context;
    }

[Authorize(Roles = "Buyer,Both")]
[HttpPost]
public async Task<IActionResult> CreateSwipe([FromBody] Swipe swipe)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);

    swipe.CreatedAt = DateTime.UtcNow;
    _context.Swipes.Add(swipe);
    await _context.SaveChangesAsync();

    if (swipe.Direction == SwipeDirection.Right)
    {
        var post = await _context.Posts.FindAsync(swipe.PostId);
        if (post == null) return NotFound("Post not found");

        var chatExists = await _context.Chats.AnyAsync(c =>
            c.BuyerId == swipe.BuyerId && c.PostId == swipe.PostId);

        if (!chatExists)
        {
            var chat = new Chat
            {
                BuyerId = swipe.BuyerId,
                SellerId = post.UserId,
                PostId = post.Id,
                Messages = new List<Message>
                {
                    new Message
                    {
                        SenderId = swipe.BuyerId,
                        Text = "Hey! I liked your post."
                    }
                }
            };

            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
        }
    }

    return CreatedAtAction(nameof(GetSwipe), new { id = swipe.Id }, swipe);
}

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSwipe(int id)
    {
        var swipe = await _context.Swipes.FindAsync(id);
        if (swipe == null) return NotFound();

        return Ok(swipe);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMySwipes()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var swipes = await _context.Swipes
            .Where(s => s.BuyerId == userId)
            .ToListAsync();

        return Ok(swipes);
    }
}
