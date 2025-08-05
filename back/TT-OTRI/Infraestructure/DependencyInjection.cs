using Microsoft.Extensions.DependencyInjection;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Application.Services;
using TT_OTRI.Infrastructure.InMemory;

namespace TT_OTRI.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IResolutionRepository, ResolutionRepository>(); // swap later por EF
        services.AddScoped<ResolutionService>();
        return services;
    }
}