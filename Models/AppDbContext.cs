using car_swipe_dotnet.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Swipe> Swipes { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Sale> Sales { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Sale>()
            .HasIndex(s => s.PostId)
            .IsUnique();
    }
    
    public static class DbInitializer
{
    public static void Seed(AppDbContext context)
    {
        if (context.Users.Any()) return; // DB already seeded

        var users = new List<User>
        {
            new User { Username = "seller1", Email = "seller1@test.com", PasswordHash = "hashed", Location = "Tampa", Role = "Seller" },
            new User { Username = "buyer1", Email = "buyer1@test.com", PasswordHash = "hashed", Location = "Tampa", Role = "Buyer" }
        };

        context.Users.AddRange(users);
        context.SaveChanges();

        var post = new Post
        {
            UserId = users[0].Id,
            Title = "2007 Honda Accord",
            Description = "Great condition, low miles",
            Make = "Honda",
            Model = "Accord",
            Year = 2007,
            Mileage = 85000,
            Price = 4500,
            Location = "Tampa",
            ImageUrls = new List<string> { "https://example.com/car.jpg" },
        };

        context.Posts.Add(post);
        context.SaveChanges();

        var swipe = new Swipe
        {
            BuyerId = users[1].Id,
            PostId = post.Id,
            Direction = SwipeDirection.Right
        };

        context.Swipes.Add(swipe);
        context.SaveChanges();

        if (swipe.Direction == SwipeDirection.Right)
        {
            var chat = new Chat
            {
                BuyerId = users[1].Id,
                SellerId = users[0].Id,
                PostId = post.Id,
                Messages = new List<Message>
                {
                    new Message
                    {
                        SenderId = users[1].Id,
                        Text = "Hi, I'm interested!"
                    }
                }
            };

            context.Chats.Add(chat);
            context.SaveChanges();
        }
    }
}

}
