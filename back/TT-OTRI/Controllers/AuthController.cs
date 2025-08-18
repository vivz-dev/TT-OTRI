// ============================================================================
// POST /api/auth/exchange  (requiere AAD); devuelve App JWT con email y idPersona
// ============================================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Services;   // <- EspolUserService
using TT_OTRI.Infrastructure.Auth;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAppTokenService _tokenSvc;
    private readonly EspolUserService _espolSvc; // ✅ nuevo

    public AuthController(IAppTokenService tokenSvc, EspolUserService espolSvc)
    {
        _tokenSvc = tokenSvc;
        _espolSvc = espolSvc;
    }

    [HttpPost("exchange")]
    [Authorize(AuthenticationSchemes = AuthSetup.AzureScheme)]
    public async Task<IActionResult> Exchange(CancellationToken ct)
    {
        var u = HttpContext.User;
        if (!(u?.Identity?.IsAuthenticated ?? false))
            return Unauthorized();

        // --- helpers para email/tenant (igual que ya tenías) ---
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
            return u.FindFirst("emails")?.Value;
        }

        string FirstNonEmpty(params string?[] xs)
            => xs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s)) ?? string.Empty;

        var oid   = FirstNonEmpty(u.FindFirstValue("oid"),
                                  u.FindFirstValue(ClaimTypes.NameIdentifier),
                                  Guid.NewGuid().ToString());
        var name  = FirstNonEmpty(u.FindFirstValue("name"), u.Identity?.Name, "Usuario");
        var email = FirstNonEmpty(GetEmail(u));
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { error = "No se pudo resolver el email del token de Microsoft." });

        var upn   = email;
        var tid   = GetTid(u) ?? string.Empty;

        // ✅ NUEVO: buscar IdPersona por email (ESPOL.TBL_PERSONA)
        int? idPersona = await _espolSvc.GetIdByEmailAsync(email, ct);

        // (Si ya manejas roles, puedes dejarlos como están. Aquí omitido por brevedad)
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

        if (idPersona.HasValue)
            claims.Add(new Claim("idPersona", idPersona.Value.ToString())); // ✅ claim en el JWT

        var token = _tokenSvc.IssueToken(claims);
        return Ok(new { token, email, idPersona });
    }
}
