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
/// correspondientes de repositorios y registra los servicios de negocio.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Agrega los servicios y repositorios de infraestructura a la colección de servicios.
    /// Lee "Data:Provider" y elige implementaciones InMemory (default) o DB2.
    /// Los servicios de aplicación se registran SIEMPRE como Scoped.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        var provider = cfg.GetSection("Data")["Provider"]?.Trim().ToLowerInvariant() ?? "inmemory";

        switch (provider)
        {
            case "db2":
                // ─── Repositorios DB2 (descomentar cuando los implementes) ───
                // services.AddScoped<IResolutionRepository, ResolutionRepositoryDb2>();
                // services.AddScoped<IDistributionResolutionRepository, DistributionResolutionRepositoryDb2>();
                // services.AddScoped<IRoleRepository, RoleRepositoryDb2>(); // Roles en DB2

                // Utilitario de prueba de conectividad/lectura DB2
                services.AddSingleton<TestDb2Repository>();
                break;

            default: // "inmemory" y cualquier otro valor no reconocido
                // ─── Repositorios InMemory (Singleton para persistir el store) ───
                services.AddSingleton<IResolutionRepository, ResolutionRepository>();
                services.AddSingleton<IDistributionResolutionRepository, DistributionResolutionRepository>();
                services.AddSingleton<IRoleRepository, RoleRepository>(); // Roles InMemory
                break;
        }

        // ─── Servicios de aplicación (SIEMPRE) ───
        services.AddScoped<ResolutionService>();
        services.AddScoped<DistributionResolutionService>();
        services.AddScoped<RoleService>(); // Necesario para RolesController

        return services;
    }
}
