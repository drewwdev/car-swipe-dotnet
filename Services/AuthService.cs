using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(IConfiguration config) => _config = config;

    public string HashPassword(string password) =>
        _hasher.HashPassword(null, password);

    public bool VerifyPassword(string hashedPassword, string password)
    {
        var result = _hasher.VerifyHashedPassword(null, hashedPassword, password);
        return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }

    public string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("n")),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
        };

        AddIfNotEmpty(claims, new Claim(ClaimTypes.Name, user.Username));
        AddIfNotEmpty(claims, new Claim("preferred_username", user.Username));
        AddIfNotEmpty(claims, new Claim(ClaimTypes.Email, user.Email));
        AddIfNotEmpty(claims, new Claim(ClaimTypes.Role, user.Role));
        AddIfNotEmpty(claims, new Claim("loc", user.Location));

        var issuer   = _config["Jwt:Issuer"]   ?? _config["JWT:Issuer"];
        var audience = _config["Jwt:Audience"] ?? _config["JWT:Audience"];

        var (key, kid) = LoadSigningKey();
        key.KeyId = kid;
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var minutes = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var m) ? m : (60 * 24 * 7);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static void AddIfNotEmpty(List<Claim> list, Claim claim)
    {
        if (!string.IsNullOrWhiteSpace(claim.Value)) list.Add(claim);
    }

    private (SymmetricSecurityKey key, string kid) LoadSigningKey()
    {
        var keyMaterial =
            _config["Jwt:Key_New"] ??
            _config["Jwt:Key"] ??
            _config["JWT:SigningKey"];

        if (string.IsNullOrWhiteSpace(keyMaterial))
            throw new InvalidOperationException("JWT signing key missing (Jwt:Key_New / Jwt:Key / JWT:SigningKey).");

        var keyBytes = Encoding.UTF8.GetBytes(keyMaterial);
        var key = new SymmetricSecurityKey(keyBytes);

        var explicitKid = _config["Jwt:KeyId"] ?? _config["Jwt:Kid"];
        var kid = !string.IsNullOrWhiteSpace(explicitKid) ? explicitKid! : DeriveKid(keyBytes);

        return (key, kid);
    }

    private static string DeriveKid(byte[] keyBytes)
    {
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(keyBytes);
        var sb = new StringBuilder(16);
        for (int i = 0; i < 8; i++) sb.Append(hash[i].ToString("x2"));
        return $"hs256-{sb}";
    }
}
