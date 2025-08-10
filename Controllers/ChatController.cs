using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using car_swipe_dotnet.Dtos;
using car_swipe_dotnet.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetChatsForUser()
    {
        var userId = GetUserId();

        var chats = await _context.Chats
            .AsNoTracking()
            .Include(c => c.Messages)
            .Include(c => c.Post)
            .Where(c => c.BuyerId == userId || c.SellerId == userId)
            .ToListAsync();

        return Ok(chats);
    }

    [HttpPost]
    public async Task<IActionResult> CreateChat([FromBody] Chat chat)
    {
        var userId = GetUserId();

        if (chat.BuyerId != userId && chat.SellerId != userId)
            return Forbid();

        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChatsForUser), new { }, chat);
    }

    [HttpGet("{chatId:int}/messages")]
    public async Task<IActionResult> GetMessages(int chatId)
    {
        var chat = await _context.Chats.FindAsync(chatId);
        if (chat == null) return NotFound();

        var userId = GetUserId();
        if (chat.BuyerId != userId && chat.SellerId != userId)
            return Forbid();

        var messages = await _context.Messages
            .AsNoTracking()
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("{chatId:int}/messages")]
    public async Task<IActionResult> SendMessage(int chatId, [FromBody] SendMessageDto dto)
    {
        var chat = await _context.Chats.FindAsync(chatId);
        if (chat == null) return NotFound();

        var userId = GetUserId();
        if (chat.BuyerId != userId && chat.SellerId != userId)
            return Forbid();

        var message = new Message
        {
            ChatId = chatId,
            SenderId = userId,
            Text = dto.Text,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(message);
    }

    [HttpDelete("{chatId:int}")]
    public async Task<IActionResult> DeleteChat(int chatId)
    {
        var chat = await _context.Chats.FindAsync(chatId);
        if (chat == null) return NotFound();

        var userId = GetUserId();
        if (chat.BuyerId != userId && chat.SellerId != userId)
            return Forbid();

        _context.Chats.Remove(chat);
        await _context.SaveChangesAsync();

        return NoContent();
    }

[HttpPost("{chatId:int}/close-sale")]
public async Task<ActionResult<Sale>> CloseSaleFromChat(int chatId, [FromBody] CloseFromChatDto body)
{
    var userId = GetUserId();

    var chat = await _context.Chats
        .Include(c => c.Post)
        .SingleOrDefaultAsync(c =>
            c.Id == chatId &&
            (c.BuyerId == userId || c.SellerId == userId));

    if (chat == null) return NotFound("Chat not found for this user.");

    var post = chat.Post ?? await _context.Posts.FindAsync(chat.PostId);
    if (post == null) return BadRequest("Linked post not found.");

    if (post.UserId != userId) return Forbid();
    if (post.Status == PostStatus.Sold) return Conflict("Post already sold.");

    var inferredBuyerId = chat.BuyerId == userId ? chat.SellerId : chat.BuyerId;

    using var tx = await _context.Database.BeginTransactionAsync();

    var sale = new Sale
    {
        PostId = post.Id,
        SellerId = post.UserId,
        BuyerId = inferredBuyerId,
        Amount = body.Amount,
        CreatedAt = DateTime.UtcNow,
        ClosedAt = DateTime.UtcNow
    };

    _context.Sales.Add(sale);
    post.Status = PostStatus.Sold;

    await _context.SaveChangesAsync();
    await tx.CommitAsync();

    return Ok(sale);
}

    private int GetUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(val)) throw new InvalidOperationException("User id claim not found.");
        return int.Parse(val);
    }
}
