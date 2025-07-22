using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuthService _auth;

    public AuthController(AppDbContext context, AuthService auth)
    {
        _context = context;
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var normalizedEmail = dto.Email.Trim().ToLower();
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            return BadRequest("Email already in use.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = _auth.HashPassword(dto.Password),
            Location = dto.Location
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _auth.GenerateJwtToken(user);
        return Ok(new { token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !_auth.VerifyPassword(user.PasswordHash, dto.Password))
            return Unauthorized("Invalid email or password.");

        var token = _auth.GenerateJwtToken(user);
        return Ok(new { token });
    }
}
