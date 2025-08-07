using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using car_swipe_dotnet.Dtos;

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
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var chats = await _context.Chats
        .Include(c => c.Messages)
        .Include(c => c.Post)
        .Where(c => c.BuyerId == userId || c.SellerId == userId)
        .ToListAsync();

    return Ok(chats);
}

    [HttpPost]
    public async Task<IActionResult> CreateChat([FromBody] Chat chat)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (chat.BuyerId != userId && chat.SellerId != userId)
            return Forbid();

        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChatsForUser), new { }, chat);
    }

    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetMessages(int chatId)
    {
        var chat = await _context.Chats.FindAsync(chatId);
        if (chat == null) return NotFound();

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        if (chat.BuyerId != userId && chat.SellerId != userId)
            return Forbid();

        var messages = await _context.Messages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

[HttpPost("{chatId}/messages")]
public async Task<IActionResult> SendMessage(int chatId, [FromBody] SendMessageDto dto)
{
    var chat = await _context.Chats.FindAsync(chatId);
    if (chat == null) return NotFound();

    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
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
}
