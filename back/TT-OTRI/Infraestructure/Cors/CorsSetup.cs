// ============================================================================
// Archivo: CorsSetup.cs
// Ubicación: TT-OTRI/Infrastructure/Cors/CorsSetup.cs
// Descripción:
//   Registro y configuración de CORS para permitir que el frontend en
//   http://localhost:3000 (y 127.0.0.1:3000) consuma la API con credenciales.
// ============================================================================

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TT_OTRI.Infrastructure.Cors;

public static class CorsSetup
{
    /// <summary>Nombre de la política de CORS registrada.</summary>
    public const string PolicyName = "_otriCors";

    public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration cfg)
    {
        // Orígenes permitidos (desde config o defaults)
        var configured = cfg.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
        var defaults = new[] { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173" };

        // Normalizamos y unificamos
        var origins = configured.Concat(defaults)
                                .Select(o => o.Trim())
                                .Where(o => !string.IsNullOrWhiteSpace(o))
                                .Distinct(StringComparer.OrdinalIgnoreCase)
                                .ToArray();

        services.AddCors(opt =>
        {
            opt.AddPolicy(PolicyName, p =>
            {
                // Permitimos orígenes explícitos y manejamos el caso 127.0.0.1 vs localhost
                p.WithOrigins(origins)
                 // Si usas subdominios en dev, puedes habilitar wildcard:
                 // .SetIsOriginAllowed(origin =>
                 //     origins.Contains(origin, StringComparer.OrdinalIgnoreCase) ||
                 //     (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase)) ||
                 //     (origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase))
                 // )
                 .AllowAnyHeader()      // incluye Authorization
                 .AllowAnyMethod()      // GET/POST/PATCH/DELETE...
                 .AllowCredentials()    // permite cookies y Authorization
                 // Exponer cabeceras útiles (Location para 201, Content-Disposition para descargas)
                 .WithExposedHeaders("Location", "Content-Disposition");
            });
        });

        return services;
    }
}
