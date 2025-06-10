using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class SwipesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SwipesController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/swipes
    [HttpPost]
    public async Task<IActionResult> CreateSwipe([FromBody] Swipe swipe)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        swipe.CreatedAt = DateTime.UtcNow;
        _context.Swipes.Add(swipe);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSwipe), new { id = swipe.Id }, swipe);
    }

    // GET: api/swipes/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSwipe(int id)
    {
        var swipe = await _context.Swipes.FindAsync(id);
        if (swipe == null) return NotFound();

        return Ok(swipe);
    }

    // Optional: GET all swipes for a buyer
    [HttpGet("buyer/{buyerId}")]
    public async Task<IActionResult> GetSwipesForBuyer(int buyerId)
    {
        var swipes = await _context.Swipes
            .Where(s => s.BuyerId == buyerId)
            .ToListAsync();

        return Ok(swipes);
    }
}
