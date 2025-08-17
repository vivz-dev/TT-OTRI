// ============================================================================
// Archivo: AppTokenService.cs
// Ubicación: TT-OTRI/Infrastructure/Auth/AppTokenService.cs
// Descripción:
//   Implementación del servicio encargado de emitir tokens JWT firmados para
//   la autenticación dentro de la aplicación TT-OTRI.
//
// Contenido:
//   - Interfaz IAppTokenService → define el contrato para emitir tokens JWT.
//   - Clase AppTokenService     → implementación concreta que utiliza las
//                                 opciones configuradas en AppJwtOptions.
//
// Funcionamiento:
//   1. Se recibe la configuración de AppJwtOptions (Issuer, Audience, SigningKey,
//      MinutesToExpire) a través de inyección de dependencias.
//   2. Se inicializan las credenciales de firma (HMAC-SHA256).
//   3. Al invocar IssueToken(claims):
//        • Se construye un JwtSecurityToken con los claims proporcionados.
//        • Se asignan: Issuer, Audience, fechas de validez y expiración.
//        • Se firma con la clave secreta configurada.
//   4. Se devuelve el token JWT en formato string listo para usarse.
//
// Notas de seguridad:
//   - La SigningKey debe ser suficientemente robusta (mínimo 32 caracteres).
//   - El tiempo de expiración es configurable en AppJwtOptions (default: 30 min).
//   - Los claims deben incluir información mínima del usuario (ej. sub, email).
// ============================================================================

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace TT_OTRI.Infrastructure.Auth;

/// <summary>
/// Contrato para un servicio que emite tokens JWT.
/// </summary>
public interface IAppTokenService
{
    /// <summary>
    /// Genera un JWT con los claims proporcionados.
    /// </summary>
    /// <param name="claims">Conjunto de claims que se incluirán en el token.</param>
    /// <returns>Token JWT en formato string.</returns>
    string IssueToken(IEnumerable<Claim> claims);
}

/// <summary>
/// Implementación del servicio que emite y firma tokens JWT
/// usando las opciones configuradas en <see cref="AppJwtOptions"/>.
/// </summary>
internal sealed class AppTokenService : IAppTokenService
{
    private readonly AppJwtOptions _opt;
    private readonly SigningCredentials _creds;

    /// <summary>
    /// Constructor que inicializa las opciones de JWT y prepara las credenciales de firma.
    /// </summary>
    /// <param name="opt">Opciones de configuración del JWT (Issuer, Audience, SigningKey, etc.).</param>
    public AppTokenService(IOptions<AppJwtOptions> opt)
    {
        _opt = opt.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.SigningKey));
        _creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    }

    /// <summary>
    /// Genera un token JWT firmado a partir de los claims especificados.
    /// </summary>
    /// <param name="claims">Claims a incluir en el token (ejemplo: sub, email, roles).</param>
    /// <returns>Token JWT en formato string listo para usarse.</returns>
    public string IssueToken(IEnumerable<Claim> claims)
    {
        var jwt = new JwtSecurityToken(
            issuer: _opt.Issuer,
            audience: _opt.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(_opt.MinutesToExpire),
            signingCredentials: _creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}
