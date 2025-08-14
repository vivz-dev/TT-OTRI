// ============================================================================
// File: Infrastructure/DependencyInjection.cs
// Registro AUTOMÁTICO por convención usando Scrutor.
// - Servicios (Application.Services): *Service  -> Scoped (Clase + Interfaces)
// - Repos InMemory (Infrastructure.InMemory): *Repository -> Singleton
// - Repos DB2 (Infrastructure.Db2): *RepositoryDb2 -> Scoped
//   Provider se toma de Data:Provider ("db2" | "inmemory").
// ============================================================================
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Scrutor;
using TT_OTRI.Application.Services;      // ancla para Services
using TT_OTRI.Infrastructure.InMemory;   // ancla para InMemory repos (p. ej. ResolutionRepository)
using TT_OTRI.Infrastructure.Db2;        // ancla para DB2 repos (p. ej. TestDb2Repository)

namespace TT_OTRI.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        var provider = cfg.GetSection("Data")["Provider"]?.Trim().ToLowerInvariant() ?? "inmemory";

        // ---------------- Servicios (siempre) ----------------
        // Exponer clases de servicios tanto como concretas como sus interfaces
        services.Scan(scan => scan
            .FromAssemblyOf<ResolutionService>()
                .AddClasses(c => c
                    .InNamespaces("TT_OTRI.Application.Services")
                    .Where(t => t.Name.EndsWith("Service")))
                .AsSelfWithInterfaces()
                .WithScopedLifetime()
        );

        // ---------------- Repos por provider -----------------
        if (provider == "db2")
        {
            // Escanea repos DB2 por convención: *RepositoryDb2
            services.Scan(scan => scan
                .FromAssemblyOf<TestDb2RepositoryDb2>() // ancla existente en Infrastructure.Db2
                    .AddClasses(c => c
                        .InNamespaces("TT_OTRI.Infrastructure.Db2")
                        .Where(t => t.Name.EndsWith("RepositoryDb2")))
                    .AsImplementedInterfaces()
                    .WithScopedLifetime()
            );

            // Utilitario de prueba (si lo usas directamente en el controller)
            // ⚠️ Debe ser Scoped para no romper al inyectar DB2Connection (scoped)
            services.AddScoped<TestDb2RepositoryDb2>();
        }
        else
        {
            // Escanea repos InMemory por convención: *Repository
            services.Scan(scan => scan
                .FromAssemblyOf<ResolutionRepository>() // ancla existente en Infrastructure.InMemory
                    .AddClasses(c => c
                        .InNamespaces("TT_OTRI.Infrastructure.InMemory")
                        .Where(t => t.Name.EndsWith("Repository")))
                    .AsImplementedInterfaces()
                    .WithSingletonLifetime()
            );
        }

        return services;
    }
}
