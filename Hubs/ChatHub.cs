using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using car_swipe_dotnet.Models;

public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task SendMessage(int chatId, string message)
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            Console.WriteLine("❌ Could not find user ID in SignalR context.");
            return;
        }

        var userId = int.Parse(userIdClaim.Value);

        var chat = await _context.Chats.FindAsync(chatId);
        if (chat == null) return;

        var newMessage = new Message
        {
            ChatId = chatId,
            SenderId = userId,
            Text = message,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(newMessage);
        await _context.SaveChangesAsync();

        await Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", newMessage);
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var chatId = httpContext?.Request.Query["chatId"];

        if (int.TryParse(chatId, out int parsedChatId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{parsedChatId}");
        }

        await base.OnConnectedAsync();
    }

    public async Task JoinChatGroup(int chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }

    public async Task LeaveChatGroup(int chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
    }
}
