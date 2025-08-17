// ============================================================================
// DB2 Setup: normaliza ConnectionStrings:Db2 y registra DB2Connection (Scoped)
// ============================================================================
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TT_OTRI.Infrastructure.Db2;

public static class Db2Setup
{
    public static IServiceCollection AddDb2(this IServiceCollection services, IConfiguration cfg)
    {
        var envVar = Environment.GetEnvironmentVariable("DB2_CONNSTRING");
        var cfgDb2  = cfg.GetConnectionString("Db2");
        var cfgDb2n = cfg.GetConnectionString("Db2_NoSSL");

        if (string.IsNullOrWhiteSpace(cfgDb2))
        {
            var effective = !string.IsNullOrWhiteSpace(cfgDb2n) ? cfgDb2n : envVar;
            if (!string.IsNullOrWhiteSpace(effective))
            {
                var dict = new Dictionary<string, string?> { ["ConnectionStrings:Db2"] = effective };
                var mem = new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
                (cfg as IConfigurationBuilder)?.AddInMemoryCollection(dict);
            }
        }

        services.AddScoped(sp =>
        {
            var cs = sp.GetRequiredService<IConfiguration>().GetConnectionString("Db2")
                     ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2.");
            return new DB2Connection(cs);
        });

        return services;
    }
}