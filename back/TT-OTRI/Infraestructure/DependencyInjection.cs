// ============================================================================
// File: Infrastructure/DependencyInjection.cs
// Registro AUTOMÁTICO por convención usando Scrutor.
// - Services  (TT_OTRI.Application.Services[.*]): *Service       -> Scoped (Clase + Interfaces)
// - Repos DB2 (TT_OTRI.Infrastructure.Db2[.*]) : *RepositoryDb2  -> Scoped (Interfaces)
// - Repos Mem (TT_OTRI.Infrastructure.InMemory[.*]): *Repository -> Singleton (Interfaces)
//   Provider se toma de Data:Provider ("db2" | "inmemory").
// ============================================================================

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Scrutor;
using TT_OTRI.Application.Services;     // ancla para Services
using TT_OTRI.Infrastructure.InMemory;  // ancla para InMemory repos (p. ej. ResolutionRepository)
using TT_OTRI.Infrastructure.Db2;       // ancla para DB2 repos (p. ej. TestDb2RepositoryDb2)

namespace TT_OTRI.Infrastructure;

public static class DependencyInjection
{
    private const string ServicesNs = "TT_OTRI.Application.Services";
    private const string InMemoryNs = "TT_OTRI.Infrastructure.InMemory";
    private const string Db2Ns      = "TT_OTRI.Infrastructure.Db2";

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        var provider = (cfg["Data:Provider"] ?? "inmemory").Trim().ToLowerInvariant();

        // ---------------- Servicios (siempre) ----------------
        // Incluye subnamespaces usando filtro por Namespace.
        services.Scan(scan => scan
            .FromAssemblyOf<ResolutionService>()
                .AddClasses(c => c
                    .Where(t =>
                        t.IsClass &&
                        !t.IsAbstract &&
                        t.Name.EndsWith("Service") &&
                        t.Namespace is not null &&
                        (t.Namespace == ServicesNs || t.Namespace.StartsWith(ServicesNs + "."))
                    )
                )
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
                        .Where(t =>
                            t.IsClass &&
                            !t.IsAbstract &&
                            t.Name.EndsWith("RepositoryDb2") &&
                            t.Namespace is not null &&
                            (t.Namespace == Db2Ns || t.Namespace.StartsWith(Db2Ns + "."))
                        )
                    )
                    .AsImplementedInterfaces()
                    .WithScopedLifetime()
            );

            // Utilitario de prueba (si lo inyectas directamente en controllers)
            services.AddScoped<TestDb2RepositoryDb2>();
        }
        else
        {
            // Escanea repos InMemory por convención: *Repository
            services.Scan(scan => scan
                .FromAssemblyOf<ResolutionRepository>() // ancla existente en Infrastructure.InMemory
                    .AddClasses(c => c
                        .Where(t =>
                            t.IsClass &&
                            !t.IsAbstract &&
                            t.Name.EndsWith("Repository") &&
                            t.Namespace is not null &&
                            (t.Namespace == InMemoryNs || t.Namespace.StartsWith(InMemoryNs + "."))
                        )
                    )
                    .AsImplementedInterfaces()
                    .WithSingletonLifetime()
            );
        }

        return services;
    }
}
