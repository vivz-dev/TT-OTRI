// ============================================================================
// File: Infrastructure/DependencyInjection.cs  (PATCH)
// ============================================================================
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions; // <-- para TryAdd*
using Scrutor;
using TT_OTRI.Application.Services;
using TT_OTRI.Infrastructure.InMemory;
using TT_OTRI.Infrastructure.Db2;


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
        services.Scan(scan => scan
            .FromAssemblyOf<ResolutionService>() // ancla
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

        // 🔧 Fallback explícito (arreglo inmediato)
        // Si PersonRolesService implementa IPersonRolesService, quedará registrado aunque el escaneo falle.
        services.TryAddScoped<TT_OTRI.Application.Interfaces.IPersonRolesService,
                              TT_OTRI.Application.Services.PersonRolesService>();

        // ---------------- Repos por provider -----------------
        if (provider == "db2")
        {
            services.Scan(scan => scan
                .FromAssemblyOf<TestDb2RepositoryDb2>() // ancla DB2
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

            services.AddScoped<TestDb2RepositoryDb2>();
        }
        else
        {
            services.Scan(scan => scan
                .FromAssemblyOf<ResolutionRepository>() // ancla InMemory
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
