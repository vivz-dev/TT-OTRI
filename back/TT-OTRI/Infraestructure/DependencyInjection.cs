// ============================================================================
// File: Infrastructure/DependencyInjection.cs
// Registro AUTOMÁTICO por convención usando Scrutor.
// - Servicios: TT_OTRI.Application.Services → *Service → Scoped
// - Repos InMemory: TT_OTRI.Infrastructure.InMemory → *Repository → Singleton
// - Repos DB2: TT_OTRI.Infrastructure.Db2 → *RepositoryDb2 → Scoped
// Provider se toma de Data:Provider ("db2" | "inmemory").
// ============================================================================
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Scrutor;
using TT_OTRI.Application.Services;      // ancla para Services
using TT_OTRI.Infrastructure.InMemory;   // ancla para InMemory repos
using TT_OTRI.Infrastructure.Db2;        // ancla para DB2 (usaremos TestDb2Repository)

namespace TT_OTRI.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        var provider = cfg.GetSection("Data")["Provider"]?.Trim().ToLowerInvariant() ?? "inmemory";

        // ---------------- Servicios (siempre) ----------------
        services.Scan(scan => scan
            .FromAssemblyOf<ResolutionService>()
                .AddClasses(c => c
                    .InNamespaces("TT_OTRI.Application.Services")
                    .Where(t => t.Name.EndsWith("Service")))
                .AsSelf()
                .WithScopedLifetime()
        );

        // ---------------- Repos por provider -----------------
        if (provider == "db2")
        {
            // Escanea repos DB2 por convención: *RepositoryDb2
            services.Scan(scan => scan
                .FromAssemblyOf<TestDb2Repository>() // 👈 ancla que SÍ existe
                    .AddClasses(c => c
                        .InNamespaces("TT_OTRI.Infrastructure.Db2")
                        .Where(t => t.Name.EndsWith("RepositoryDb2")))
                    .AsImplementedInterfaces()
                    .WithScopedLifetime()
            );

            // Utilitario de prueba (si lo usas)
            services.AddSingleton<TestDb2Repository>();
        }
        else
        {
            // Escanea repos InMemory por convención: *Repository
            services.Scan(scan => scan
                .FromAssemblyOf<ResolutionRepository>()
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
