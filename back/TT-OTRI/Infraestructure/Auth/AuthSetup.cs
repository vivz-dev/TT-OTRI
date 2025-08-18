// ============================================================================
// Archivo: AuthSetup.cs
// Ubicación: TT-OTRI/Infrastructure/Auth/AuthSetup.cs
// Descripción:
//   Clase estática que extiende IServiceCollection para registrar y configurar
//   los esquemas de autenticación de la aplicación TT-OTRI.
//
// Esquemas configurados:
//   1) EntraIdExchange (Azure AD):
//        - Permite recibir tokens emitidos por Microsoft Entra ID (antes Azure AD).
//        - Se utiliza únicamente para el endpoint /api/auth/exchange, donde
//          el frontend entrega un token de Microsoft que será validado.
//   2) AppJwt (JWT interno):
//        - Generado y firmado por la propia aplicación.
//        - Se utiliza como esquema principal para el resto de las peticiones.
//        - Incluye validación de emisor, audiencia y firma HMAC-SHA256.
//
// Política de autorización:
//   - AppPolicy (AppJwtOnly): fuerza a que solo el esquema AppJwt sea válido.
//     Se define como política por defecto para proteger los controladores.
//
// Flujo de configuración:
//   1. Se leen las opciones desde appsettings.json o variables de entorno:
//        • AzureAdOptions → Configuración de Entra ID (TenantId, ClientId, Audience).
//        • AppJwtOptions  → Configuración del JWT interno (Issuer, Audience, SigningKey).
//   2. Se registra el servicio IAppTokenService para emitir tokens internos.
//   3. Se configuran ambos esquemas de autenticación con JwtBearerHandler.
//   4. Se añade una política de autorización predeterminada (AppJwtOnly).
//
// Notas de seguridad:
//   - AppJwt:SigningKey es obligatoria y debe mantenerse secreta (no versionar).
//   - Los tokens de Microsoft se validan contra emisores v1 y v2 de Entra ID.
//   - Se recomienda habilitar siempre HTTPS para la validación de tokens.
// ============================================================================

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace TT_OTRI.Infrastructure.Auth;

public static class AuthSetup
{
    // Constantes que identifican los esquemas y la política por defecto
    public const string AzureScheme = "EntraIdExchange";
    public const string AppScheme   = "AppJwt";
    public const string AppPolicy   = "AppJwtOnly";

    /// <summary>
    /// Registra y configura los esquemas de autenticación (EntraIdExchange + AppJwt).
    /// </summary>
    /// <param name="services">Contenedor de servicios de la aplicación.</param>
    /// <param name="cfg">Configuración de la aplicación (IConfiguration).</param>
    /// <returns>La colección de servicios extendida.</returns>
    public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration cfg)
    {
        // 1) Bind de opciones desde configuración
        services.Configure<AzureAdOptions>(cfg.GetSection("AzureAd"));
        services.Configure<AppJwtOptions>(cfg.GetSection("AppJwt"));
        services.AddSingleton<IAppTokenService, AppTokenService>();

        var ad = cfg.GetSection("AzureAd").Get<AzureAdOptions>() ?? new();
        var app = cfg.GetSection("AppJwt").Get<AppJwtOptions>()
                  ?? throw new InvalidOperationException("Falta AppJwt en configuración.");
        if (string.IsNullOrWhiteSpace(app.SigningKey))
            throw new InvalidOperationException("Falta AppJwt:SigningKey");

        var azureV2Issuer = $"{ad.Instance}{ad.TenantId}/v2.0";
        var azureV1Issuer = $"https://sts.windows.net/{ad.TenantId}/";

        // 2) Configuración de autenticación
        services
            .AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = AppScheme;
                o.DefaultChallengeScheme    = AppScheme;
            })
            // 2.1) Esquema de Azure AD (solo para /api/auth/exchange)
            .AddJwtBearer(AzureScheme, options =>
            {
                options.Authority = $"{ad.Instance}{ad.TenantId}/v2.0";
                options.RequireHttpsMetadata = true;

                var validAudiences = new List<string>();
                if (!string.IsNullOrWhiteSpace(ad.Audience)) validAudiences.Add(ad.Audience);
                if (!string.IsNullOrWhiteSpace(ad.ClientId)) validAudiences.Add(ad.ClientId);

                var validIssuers = new List<string>();
                if (!string.IsNullOrWhiteSpace(azureV2Issuer)) validIssuers.Add(azureV2Issuer);
                if (!string.IsNullOrWhiteSpace(azureV1Issuer)) validIssuers.Add(azureV1Issuer);

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = validIssuers,
                    ValidateAudience = true,
                    ValidAudiences = validAudiences,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2),
                    NameClaimType = "name",
                    RoleClaimType = "roles"
                };
            })
            // 2.2) Esquema de JWT interno (AppJwt)
            .AddJwtBearer(AppScheme, options =>
            {
                options.RequireHttpsMetadata = false; // ← SOLO desarrollo si usas HTTP
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = app.Issuer,
                    ValidateAudience = true,
                    ValidAudience = app.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(app.SigningKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = ClaimTypes.Role
                };
            });

        // 3) Autorización → se define política por defecto que requiere AppJwt
        services.AddAuthorization(o =>
        {
            // Política nombrada (si la quieres usar explícita)
            o.AddPolicy(AppPolicy, p => p.AddAuthenticationSchemes(AppScheme).RequireAuthenticatedUser());

            // ✅ Política por defecto para endpoints sin metadata: usa AppJwt
            o.FallbackPolicy = new AuthorizationPolicyBuilder()
                .AddAuthenticationSchemes(AppScheme)
                .RequireAuthenticatedUser()
                .Build();
        });

        return services;
    }
}
