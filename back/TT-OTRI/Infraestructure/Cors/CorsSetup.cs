// ============================================================================
// Archivo: CorsSetup.cs
// Ubicación: TT-OTRI/Infrastructure/Cors/CorsSetup.cs
// Descripción:
//   Clase estática que extiende IServiceCollection para registrar y configurar 
//   las políticas de CORS (Cross-Origin Resource Sharing) en la aplicación TT-OTRI.
//
// Propósito:
//   - Permitir que clientes web externos (ej. frontend en React/Angular/Vue) 
//     puedan comunicarse con la API TT-OTRI desde diferentes dominios.
//   - Controlar qué orígenes tienen permiso para hacer solicitudes a la API.
//
// Constantes:
//   - PolicyName → nombre de la política de CORS registrada ("_otriCors").
//
// Funcionamiento:
//   1. Se leen los orígenes permitidos desde la configuración (appsettings.json → Cors:Origins).
//   2. Si no se encuentra configuración, se asignan orígenes por defecto:
//        - http://localhost:3000 (React por defecto).
//        - http://localhost:5173 (Vite por defecto).
//   3. Se registra una política CORS que permite:
//        - Los orígenes definidos.
//        - Cualquier cabecera (AllowAnyHeader).
//        - Cualquier método HTTP (AllowAnyMethod).
//        - Envío de credenciales (cookies, headers de autenticación).
//
// Uso típico:
//   - Registrar en Program.cs:
//        services.AddAppCors(cfg);
//   - Aplicar en middleware:
//        app.UseCors(CorsSetup.PolicyName);
//
// Ejemplo en appsettings.json:
//   "Cors": {
//     "Origins": [
//       "http://localhost:3000",
//       "https://mi-frontend-produccion.com"
//     ]
//   }
// ============================================================================

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TT_OTRI.Infrastructure.Cors;

public static class CorsSetup
{
    /// <summary>
    /// Nombre de la política de CORS registrada.
    /// </summary>
    public const string PolicyName = "_otriCors";

    /// <summary>
    /// Registra la política de CORS leyendo los orígenes permitidos
    /// desde la configuración o asignando valores por defecto.
    /// </summary>
    /// <param name="services">Contenedor de servicios de la aplicación.</param>
    /// <param name="cfg">Configuración de la aplicación (IConfiguration).</param>
    /// <returns>La colección de servicios extendida.</returns>
    public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration cfg)
    {
        // Se obtienen los orígenes permitidos desde configuración
        var origins = cfg.GetSection("Cors:Origins").Get<string[]>() 
                      ?? new[] { "http://localhost:3000", "http://localhost:5173" };

        // Se registra la política CORS
        services.AddCors(opt =>
        {
            opt.AddPolicy(PolicyName, p => p
                .WithOrigins(origins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());
        });

        return services;
    }
}
