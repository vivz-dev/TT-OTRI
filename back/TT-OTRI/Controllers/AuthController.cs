// using System.IdentityModel.Tokens.Jwt;
// using System.Security.Claims;
// using System.Text;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.IdentityModel.Tokens;
//
// namespace TT_OTRI.Controllers;
//
// public record AuthUserDto(string Id, string Username, string Email, string[] Roles, string[] Permissions);
// public record AuthResponseDto(string AccessToken, DateTime ExpiresAt, AuthUserDto User);
//
// [ApiController]
// [Route("api/auth")]
// public class AuthController : ControllerBase
// {
//     private readonly IConfiguration _cfg;
//     public AuthController(IConfiguration cfg) => _cfg = cfg;
//
//     // Este endpoint espera: Authorization: Bearer <AAD_access_token>
//     [HttpPost("exchange")]
//     [Authorize(AuthenticationSchemes = "AzureAD")] // valida el AAD token
//     public ActionResult<AuthResponseDto> Exchange()
//     {
//         // A estas alturas, el token de Azure AD ya fue validado por JwtBearer("AzureAD")
//         // Toma info base de claims de AAD:
//         var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) 
//                   ?? User.FindFirstValue("oid") 
//                   ?? User.FindFirstValue("sub")
//                   ?? Guid.NewGuid().ToString();
//
//         var username = User.Identity?.Name 
//                        ?? User.FindFirstValue("preferred_username") 
//                        ?? User.FindFirstValue("unique_name")
//                        ?? "usuario";
//
//         var email = User.FindFirstValue(ClaimTypes.Email) 
//                     ?? User.FindFirstValue("preferred_username") 
//                     ?? "n/a@espol.edu.ec";
//
//         // TODO: Mapea a tu usuario interno y carga roles/permisos desde tu DB
//         var user = new AuthUserDto(
//             Id: sub,
//             Username: username,
//             Email: email,
//             Roles: new[] { "GestorOTRI" }, // ejemplo
//             Permissions: new[] { "Resoluciones.Read", "Resoluciones.Create" }
//         );
//
//         var token = CreateAppJwt(user, out var expiresAt);
//         return Ok(new AuthResponseDto(token, expiresAt, user));
//     }
//
//     private string CreateAppJwt(AuthUserDto user, out DateTime expiresAt)
//     {
//         var jwt = _cfg.GetSection("Jwt");
//         var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
//         var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
//
//         var now = DateTime.UtcNow;
//         var minutes = int.Parse(jwt["AccessTokenMinutes"] ?? "60");
//         expiresAt = now.AddMinutes(minutes);
//
//         var claims = new List<Claim>
//         {
//             new(JwtRegisteredClaimNames.Sub, user.Id),
//             new(JwtRegisteredClaimNames.UniqueName, user.Username),
//             new(JwtRegisteredClaimNames.Email, user.Email),
//             new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
//             new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
//         };
//         claims.AddRange(user.Roles.Select(r => new Claim(ClaimTypes.Role, r)));
//         claims.AddRange(user.Permissions.Select(p => new Claim("perm", p)));
//
//         var token = new JwtSecurityToken(
//             issuer: jwt["Issuer"],
//             audience: jwt["Audience"],
//             claims: claims,
//             notBefore: now,
//             expires: expiresAt,
//             signingCredentials: creds);
//
//         return new JwtSecurityTokenHandler().WriteToken(token);
//     }
// }