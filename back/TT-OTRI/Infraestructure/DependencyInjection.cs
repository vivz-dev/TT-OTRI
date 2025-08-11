// ============================================================================
// File: Infrastructure/DependencyInjection.cs
// Selector de repositorios: InMemory o Db2, según appsettings.json.
// Este módulo extiende IServiceCollection con la configuración de la capa
// de infraestructura (repositorios y servicios) dependiendo del proveedor.
// ============================================================================

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Application.Services;
using TT_OTRI.Infrastructure.InMemory;
using TT_OTRI.Infrastructure.Db2;

namespace TT_OTRI.Infrastructure;

/// <summary>
/// Clase estática que proporciona un método de extensión para configurar
/// la infraestructura de la aplicación. Según el proveedor indicado en
/// la configuración (por defecto InMemory), selecciona las implementaciones
/// correspondientes de repositorios y servicios.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Agrega los servicios y repositorios de infraestructura a la colección de servicios.
    /// Lee la clave "Data:Provider" de la configuración para decidir si utilizar
    /// implementaciones InMemory (valor por defecto) o DB2. 
    /// - En modo "db2": se prepara el registro de repositorios DB2 (cuando existan).
    /// - En cualquier otro caso: se registran repositorios InMemory y servicios de negocio.
    /// Devuelve la colección de servicios para permitir el encadenamiento de llamadas.
    /// </summary>
    /// <param name="services">La colección de servicios a extender.</param>
    /// <param name="cfg">Configuración de la aplicación para leer el proveedor.</param>
    /// <returns>La colección de servicios con las dependencias agregadas.</returns>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        // Obtiene el proveedor configurado ("db2" o "inmemory") y lo normaliza.
        var provider = cfg.GetSection("Data")["Provider"]?.Trim().ToLowerInvariant() ?? "inmemory";

        switch (provider)
        {
            case "db2":
                // Repositorios DB2 (descomentar cuando los implementes).
                // services.AddSingleton<IResolutionRepository, ResolutionRepositoryDb2>();
                // services.AddSingleton<IDistributionResolutionRepository, DistributionResolutionRepositoryDb2>();

                // Registro de un repositorio de prueba para DB2.
                services.AddSingleton<TestDb2Repository>();
                break;

            default: // incluye "inmemory" y cualquier otro valor no reconocido
                // Repositorios InMemory
                services.AddSingleton<IResolutionRepository, ResolutionRepository>();
                services.AddSingleton<IDistributionResolutionRepository, DistributionResolutionRepository>();

                // Servicios de aplicación
                services.AddScoped<ResolutionService>();
                services.AddScoped<DistributionResolutionService>();
                break;
        }

        return services;
    }
}
