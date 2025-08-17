// ============================================================================
// Archivo: AzureAdOptions.cs
// Ubicación: TT-OTRI/Infrastructure/Auth/AzureAdOptions.cs
// Descripción:
//   Clase de configuración para integrar la autenticación con Microsoft Entra ID
//   (anteriormente Azure Active Directory). Esta clase encapsula los parámetros
//   necesarios para validar tokens emitidos por Azure AD en la aplicación TT-OTRI.
//
// Propiedades:
//   - TenantId → Identificador del inquilino (tenant) en Entra ID / Azure AD.
//                Es un GUID que representa la organización en Azure.
//   - Instance → URL base del servicio de autenticación de Microsoft.
//                Por defecto: "https://login.microsoftonline.com/".
//   - Audience → Identificador de la API registrado en Azure AD
//                (recomendado: api://<APP_ID_URI>).
//   - ClientId → Identificador único (GUID) de la aplicación en Azure AD
//                (puede usarse como alternativa a Audience).
//
// Uso típico:
//   Esta clase se llena automáticamente leyendo la sección "AzureAd" del
//   archivo appsettings.json o variables de entorno. Es utilizada en la
//   configuración del esquema de autenticación EntraIdExchange.
//
// Ejemplo de configuración en appsettings.json:
//   "AzureAd": {
//     "TenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
//     "Instance": "https://login.microsoftonline.com/",
//     "Audience": "api://<APP_ID_URI>",
//     "ClientId": "<APP_ID_GUID>"
//   }
// ============================================================================

namespace TT_OTRI.Infrastructure.Auth;

public sealed class AzureAdOptions
{
    /// <summary>
    /// Identificador del tenant (GUID) en Microsoft Entra ID.
    /// </summary>
    public string? TenantId { get; set; }

    /// <summary>
    /// URL base del servicio de login de Microsoft Entra ID.
    /// Valor por defecto: "https://login.microsoftonline.com/".
    /// </summary>
    public string Instance { get; set; } = "https://login.microsoftonline.com/";

    /// <summary>
    /// Identificador de la API en Azure AD (api://APP_ID_URI).
    /// Recomendado para validar tokens de acceso.
    /// </summary>
    public string? Audience { get; set; }

    /// <summary>
    /// Identificador único de la aplicación en Azure AD (APP_ID en formato GUID).
    /// Puede usarse como alternativa a Audience.
    /// </summary>
    public string? ClientId { get; set; }
}
