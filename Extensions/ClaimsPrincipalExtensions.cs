using System.Security.Claims;

namespace YourApp.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var val = user.FindFirstValue(ClaimTypes.NameIdentifier) 
                   ?? user.FindFirstValue("sub");
            if (string.IsNullOrEmpty(val))
                throw new InvalidOperationException("User id claim not found.");
            return int.Parse(val);
        }
    }
}
