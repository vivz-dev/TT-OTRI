// -------------------------------------------------------------------------
// File: Infrastructure/DependencyInjection.cs
// Registra infraestructura y servicios de aplicación en el contenedor DI.
// Cambiar ResolutionRepository a implementación EF Core cuando exista.
// -------------------------------------------------------------------------
using Microsoft.Extensions.DependencyInjection;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Application.Services;
using TT_OTRI.Infrastructure.InMemory;

namespace TT_OTRI.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IResolutionRepository, ResolutionRepository>();
        services.AddScoped  <ResolutionService>();
        services.AddSingleton<IDistributionResolutionRepository, DistributionResolutionRepository>();
        services.AddScoped  <DistributionResolutionService>();
        return services;
    }
}