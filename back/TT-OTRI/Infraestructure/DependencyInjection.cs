// ============================================================================
// File: Infrastructure/DependencyInjection.cs  (FIXED)
// Registro por convención + binds explícitos cuando provider = db2
// ============================================================================
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions; // TryAdd*
using Scrutor;
using TT_OTRI.Application.Services;                 // ancla Services
using TT_OTRI.Infrastructure.InMemory;              // ancla InMemory repos
using TT_OTRI.Infrastructure.Db2;                   // ancla otros Db2 repos (si los tienes)
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Infrastructure.Repositories;          // <-- ancla para ResolutionRepositoryDb2

namespace TT_OTRI.Infrastructure;

public static class DependencyInjection
{
    private const string ServicesNs   = "TT_OTRI.Application.Services";
    private const string InMemoryNs   = "TT_OTRI.Infrastructure.InMemory";
    private const string Db2Ns        = "TT_OTRI.Infrastructure.Db2";
    private const string ReposDb2Ns   = "TT_OTRI.Infrastructure.Repositories"; // <-- NUEVO

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

        // Fallbacks explícitos (si algún escaneo fallara)
        services.TryAddScoped<IPersonRolesService, PersonRolesService>();
        services.TryAddScoped<TipoProteccionService>();
        services.AddScoped<CotitularService>();
        services.AddScoped<CotitularidadTecnoService>();
        services.AddScoped<AutorService>();
        services.AddScoped<CesionService>();
        services.AddScoped<ProteccionService>();
        services.AddScoped<LicenciamientoService>();
        services.AddScoped<FacturaService>();
        services.AddScoped<RegaliaService>();
        services.AddScoped<RegistroPagoService>();
        services.AddScoped<RolPermisoService>();
        services.AddScoped<SublicenciamientoService>();
        services.AddScoped<TipoTransferenciaTecnoService>();
        services.AddScoped<TipoTransferTecnologicaService>();
        services.AddScoped<RolPersonaService>();
        services.AddScoped<CotitularidadInstService>();
        services.AddScoped<UnidadService>();

        // ---------------- Repos por provider -----------------
        if (provider == "db2")
        {
            // 1) Escanear repos DB2 (dos namespaces posibles)
            services.Scan(scan => scan
                .FromAssemblyOf<ResolutionRepositoryDb2>() // ancla en el assembly correcto
                    .AddClasses(c => c
                        .Where(t =>
                            t.IsClass &&
                            !t.IsAbstract &&
                            // aceptamos sufijos RepositoryDb2 ó Repository (por si mix)
                            (t.Name.EndsWith("RepositoryDb2") || t.Name.EndsWith("Repository")) &&
                            t.Namespace is not null &&
                            (
                                t.Namespace == Db2Ns ||
                                t.Namespace.StartsWith(Db2Ns + ".") ||
                                t.Namespace == ReposDb2Ns ||
                                t.Namespace.StartsWith(ReposDb2Ns + ".")
                            )
                        )
                    )
                    .AsImplementedInterfaces()
                    .WithScopedLifetime()
            );

            // 2) Bind explícito crítico para resoluciones
            services.AddScoped<IResolutionRepository, ResolutionRepositoryDb2>();
            services.AddScoped<ITipoProteccionRepository, TipoProteccionRepositoryDb2>();
            services.AddScoped<ICotitularRepository, CotitularRepositoryDb2>();
            services.AddScoped<ICotitularidadTecnoRepository, CotitularidadTecnoRepositoryDb2>();
            services.AddScoped<IAcuerdoDistribAutorRepository, AcuerdoDistribAutorRepositoryDb2>();
            services.AddScoped<IAutorRepository, AutorRepositoryDb2>();
            services.AddScoped<ICesionRepository, CesionRepositoryDb2>();
            services.AddScoped<IProteccionRepository, ProteccionRepositoryDb2>();
            services.AddScoped<ILicenciamientoRepository, LicenciamientoRepositoryDb2>();
            services.AddScoped<IFacturaRepository, FacturaRepositoryDb2>();
            services.AddScoped<IRegaliaRepository, RegaliaRepositoryDb2>();
            services.AddScoped<IRegistroPagoRepository, RegistroPagoRepositoryDb2>();
            services.AddScoped<IRolPermisoRepository, RolPermisoRepositoryDb2>();
            services.AddScoped<ISublicenciamientoRepository, SublicenciamientoRepositoryDb2>();
            services.AddScoped<ITipoTransferenciaTecnoRepository, TipoTransferenciaTecnoRepositoryDb2>();
            services.AddScoped<ITipoTransferTecnologicaRepository, TipoTransferTecnologicaRepositoryDb2>();
            services.AddScoped<IRolPersonaRepository, RolPersonaRepositoryDb2>();
            services.AddScoped<ICotitularidadInstRepository, CotitularidadInstRepositoryDb2>();
            services.AddScoped<IUnidadRepository, UnidadRepositoryDb2>();

            // (opcional) otros repos explícitos aquí si los necesitas
            // services.AddScoped<IOtroRepo, OtroRepoDb2>();
        }
        else
        {
            // Proveedor InMemory
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
