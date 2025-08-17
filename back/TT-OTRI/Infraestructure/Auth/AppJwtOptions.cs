// ============================================================================
// Archivo: AppJwtOptions.cs
// Ubicación: TT-OTRI/Infrastructure/Auth/AppJwtOptions.cs
// Descripción:
//   Clase de configuración que encapsula las opciones necesarias para la 
//   generación y validación de tokens JWT dentro de la aplicación TT-OTRI.
//   Se utiliza junto con el servicio de autenticación para establecer los 
//   parámetros básicos de seguridad.
//
// Propiedades:
//   - Issuer          → Identificador del emisor del token (quién lo genera).
//   - Audience        → Identificador del público o destinatario esperado.
//   - SigningKey      → Clave secreta utilizada para firmar y validar el token.
//                       * Obligatoria: si no está configurada, la API no podrá
//                         generar ni validar JWT correctamente.
//   - MinutesToExpire → Tiempo de expiración (en minutos) de cada token JWT.
//                       Por defecto está en 30 minutos.
//
// Uso típico:
//   Estas opciones se leen desde `appsettings.json` o variables de entorno y 
//   son registradas mediante inyección de dependencias en la configuración de 
//   autenticación de la aplicación.
//
// Notas de seguridad:
//   - La `SigningKey` debe mantenerse secreta y segura (NO versionarla en git).
//   - Se recomienda que tenga al menos 32 caracteres para cumplir con HMAC-SHA256.
// ============================================================================

namespace TT_OTRI.Infrastructure.Auth;

public sealed class AppJwtOptions
{
    /// <summary>
    /// Identificador del emisor del token (Issuer).
    /// </summary>
    public string Issuer { get; set; } = "tt-otri-api";

    /// <summary>
    /// Identificador del público o audiencia esperada (Audience).
    /// </summary>
    public string Audience { get; set; } = "tt-otri-api";

    /// <summary>
    /// Clave secreta utilizada para firmar los tokens JWT (obligatoria).
    /// </summary>
    public string SigningKey { get; set; } = default!; // obligatorio

    /// <summary>
    /// Tiempo de expiración del token (en minutos).
    /// </summary>
    public int MinutesToExpire { get; set; } = 30;
}
