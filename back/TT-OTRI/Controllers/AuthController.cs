// ============================================================================
// POST /api/auth/exchange  (requiere AAD); devuelve App JWT con email y roles
// ============================================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Infrastructure.Auth;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAppTokenService _tokenSvc;

    public AuthController(IAppTokenService tokenSvc) => _tokenSvc = tokenSvc;

    [HttpPost("exchange")]
    [Authorize(AuthenticationSchemes = AuthSetup.AzureScheme)]
    public IActionResult Exchange()
    {
        var u = HttpContext.User;
        if (!(u?.Identity?.IsAuthenticated ?? false))
            return Unauthorized();

        // Helpers locales
        static string? GetTid(ClaimsPrincipal u)
        {
            var tid = u.FindFirst("tid")?.Value
                ?? u.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
            if (!string.IsNullOrWhiteSpace(tid)) return tid;

            var iss = u.FindFirst("iss")?.Value;
            if (!string.IsNullOrWhiteSpace(iss) &&
                iss.StartsWith("https://sts.windows.net/", StringComparison.OrdinalIgnoreCase))
            {
                var start = "https://sts.windows.net/".Length;
                var end = iss.IndexOf('/', start);
                if (end > start) return iss.Substring(start, end - start);
            }
            return null;
        }

        static string? GetEmail(ClaimsPrincipal u)
        {
            string? v;
            v = u.FindFirst("preferred_username")?.Value;
            if (!string.IsNullOrWhiteSpace(v) && v.Contains("@")) return v;
            v = u.FindFirst("upn")?.Value;
            if (!string.IsNullOrWhiteSpace(v) && v.Contains("@")) return v;
            v = u.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
            if (!string.IsNullOrWhiteSpace(v)) return v;
            v = u.FindFirst(ClaimTypes.Email)?.Value
             ?? u.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            if (!string.IsNullOrWhiteSpace(v)) return v;
            v = u.FindFirst("unique_name")?.Value;
            if (!string.IsNullOrWhiteSpace(v) && v.Contains("@")) return v;
            v = u.FindFirst("emails")?.Value;
            return v;
        }

        string FirstNonEmpty(params string?[] xs)
            => xs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s)) ?? string.Empty;

        var oid   = FirstNonEmpty(u.FindFirstValue("oid"),
                                  u.FindFirstValue(ClaimTypes.NameIdentifier),
                                  Guid.NewGuid().ToString());
        var name  = FirstNonEmpty(u.FindFirstValue("name"), u.Identity?.Name, "Usuario");
        var email = FirstNonEmpty(GetEmail(u));
        var upn   = !string.IsNullOrWhiteSpace(email)
                    ? email
                    : FirstNonEmpty(u.FindFirst("unique_name")?.Value, "desconocido");
        var tid   = GetTid(u) ?? string.Empty;

        // TODO: mapear roles reales desde DB si aplica
        var roles = new[] { "user" };

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, oid),
            new Claim(JwtRegisteredClaimNames.Name, name),
            new Claim(JwtRegisteredClaimNames.UniqueName, upn),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("email", email),
            new Claim("tid", tid),
            new Claim("source", "msal"),
        };
        foreach (var r in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, r));
            claims.Add(new Claim("roles", r));
        }

        var token = _tokenSvc.IssueToken(claims);
        return Ok(new { token });
    }
}
