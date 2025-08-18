// ============================================================================
// POST /api/auth/exchange  (requiere AAD); devuelve App JWT con email, idPersona y roles (objetos)
// Usa: IPersonRolesService.GetPersonRolesByEmailAsync
// ============================================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Infrastructure.Auth;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAppTokenService _tokenSvc;
    private readonly IPersonRolesService _personRolesSvc;

    public AuthController(IAppTokenService tokenSvc, IPersonRolesService personRolesSvc)
    {
        _tokenSvc = tokenSvc;
        _personRolesSvc = personRolesSvc;
    }

    [HttpPost("exchange")]
    [Authorize(AuthenticationSchemes = AuthSetup.AzureScheme)]
    public async Task<IActionResult> Exchange(CancellationToken ct)
    {
        var u = HttpContext.User;
        if (!(u?.Identity?.IsAuthenticated ?? false))
            return Unauthorized();

        // ---- Helpers para email/tenant ----
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

        var upn = email;
        var tid = GetTid(u) ?? string.Empty;

        // ---- Consulta de roles vía TU interfaz existente ----
        var result = await _personRolesSvc.GetPersonRolesByEmailAsync(email, ct);
        int? idPersona = result.IdPersona;
        var roles = result.Roles?.ToList() ?? new List<RoleDto>();

        // Fallback temporal si no tiene roles
        if (roles.Count == 0)
        {
            roles.Add(new RoleDto(99, "Administrador de sistema OTRI"));
            roles.Add(new RoleDto(98, "Administrador de contrato de TT"));
            roles.Add(new RoleDto(97, "Autor"));
        }

        // ---- Claims del JWT ----
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
            claims.Add(new Claim("idPersona", idPersona.Value.ToString()));

        // roles como JSON de objetos en claim "roles"
        var rolesJson = JsonSerializer.Serialize(
            roles.Select(r => new { idRol = r.IdRol, nombre = r.Nombre })
        );
        claims.Add(new Claim("roles", rolesJson));

        // además, roles por nombre para [Authorize(Roles="...")]
        foreach (var r in roles)
        {
            if (!string.IsNullOrWhiteSpace(r.Nombre))
                claims.Add(new Claim(ClaimTypes.Role, r.Nombre));
        }

        var token = _tokenSvc.IssueToken(claims);

        return Ok(new
        {
            token,
            email,
            idPersona,
            roles = roles.Select(r => new { idRol = r.IdRol, nombre = r.Nombre })
        });
    }
}
