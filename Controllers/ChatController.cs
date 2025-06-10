using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/chat/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetChatsForUser(int userId)
    {
        var chats = await _context.Chats
            .Include(c => c.Messages)
            .Where(c => c.BuyerId == userId || c.SellerId == userId)
            .ToListAsync();

        return Ok(chats);
    }

    // POST: api/chat
    [HttpPost]
    public async Task<IActionResult> CreateChat([FromBody] Chat chat)
    {
        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetChatsForUser), new { userId = chat.BuyerId }, chat);
    }

    // GET: api/chat/{chatId}/messages
    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetMessages(int chatId)
    {
        var messages = await _context.Messages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return Ok(messages);
    }

    // POST: api/chat/{chatId}/messages
    [HttpPost("{chatId}/messages")]
    public async Task<IActionResult> SendMessage(int chatId, [FromBody] Message message)
    {
        var chatExists = await _context.Chats.AnyAsync(c => c.Id == chatId);
        if (!chatExists) return NotFound("Chat not found");

        message.ChatId = chatId;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return Ok(message);
    }
}
