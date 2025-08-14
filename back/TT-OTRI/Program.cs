// ============================================================================
// File: Program.cs
// Descripción general:
//   Punto de entrada de la API TT-OTRI usando "Minimal Hosting" en .NET 8.
//   Aquí se configuran (a) controladores y serialización, (b) DI de servicios
//   y repositorios, (c) CORS, (d) Swagger, (e) middlewares y (f) el ruteo.
//   Nota: En este setup se cablean implementaciones InMemory de los repositorios.
// ============================================================================

using TT_OTRI.Infrastructure;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using TT_OTRI.Infrastructure;
using IBM.Data.Db2;
using Microsoft.OpenApi.Models;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Application.Services;
using TT_OTRI.Infrastructure.Repositories;


var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var cfg = builder.Configuration;

// --- Config dump ---
var envVar = Environment.GetEnvironmentVariable("DB2_CONNSTRING");
var cfgCs  = builder.Configuration.GetConnectionString("Db2_NoSSL");
var cfgEnv = builder.Configuration["DB2_CONNSTRING"];

Console.WriteLine("== Config dump (claves relevantes) ==");
Console.WriteLine($"ENV.DB2_CONNSTRING len: {envVar?.Length ?? 0}");
Console.WriteLine($"CFG.ConnectionStrings:Db2_NoSSL: {cfgCs?.Length ?? 0}");

// 6) Registrar conexión scoped
builder.Services.AddScoped(_ => new DB2Connection(envVar));

// ─────────────────────────────────────────────────────────────
// Add Controllers (con enums como strings si aplicas)
// - Registra los controladores MVC.
// - Configura System.Text.Json para serializar enums como strings
//   (útil para que Swagger/Front consuma 'Vigente'/'Derogada' en vez de 86/68).
// ─────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddInfrastructure(builder.Configuration);

// ─────────────────────────────────────────────────────────────
// CORS
// - Define la política "Default" para permitir orígenes, headers y métodos.
// - Útil durante desarrollo/local; en producción restringe orígenes.
// ─────────────────────────────────────────────────────────────
var policy = "_otriCors";
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(policy, p => p
        .WithOrigins("http://localhost:3000", "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()); // si vas a usar cookies (MSAL silent, etc.)
});

// ─────────────────────────────────────────────────────────────
// Swagger básico
// - Habilita endpoints de exploración y genera un documento OpenAPI "v1".
// - SwaggerUI se activa en desarrollo (ver sección Middlewares).
// ─────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TT-OTRI API",
        Version = "v1"
    });
});

var provider = cfg.GetValue<string>("Data:Provider") ?? "InMemory";

if (provider.Equals("Db2", StringComparison.OrdinalIgnoreCase))
{
    services.AddScoped<IResolutionRepository, ResolutionRepositoryDb2>();
}
else
{
    // Si tienes un repo en memoria, registrarlo aquí.
    // services.AddScoped<IResolutionRepository, ResolutionRepositoryInMemory>();
    // Si NO tienes aún uno en memoria, deja por ahora el de Db2 para evitar nulls:
    services.AddScoped<IResolutionRepository, ResolutionRepositoryDb2>();
}


services.AddScoped<ResolutionService>();


var app = builder.Build();

app.MapGet("/healthz", () => Results.Ok(new { ok = true, time = DateTime.UtcNow }));

app.MapGet("/api/ping-db2", (DB2Connection con) =>
{
    try
    {
        con.Open();
        using var cmd = con.CreateCommand();
        cmd.CommandText = "SELECT 1 FROM SYSIBM.SYSDUMMY1";
        var one = Convert.ToInt32(cmd.ExecuteScalar());
        return Results.Ok(new { ok = true, one });
    }
    catch (Exception ex)
    {
        // te devolverá 500 con el mensaje completo
        return Results.Problem(ex.ToString());
    }
});




// ─────────────────────────────────────────────────────────────
// Middlewares
// - En Development: activa Swagger + SwaggerUI.
// - Aplica la política CORS "Default".
// - Mantiene UseAuthorization (aunque no haya autenticación ahora)
//   para no romper futuros escenarios.
// ─────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policy);
app.UseAuthorization();  // no tienes autenticación, pero puede quedar sin romper nada

// ─────────────────────────────────────────────────────────────
// Endpoints
// - Mapea los controladores (atribute routing).
// ─────────────────────────────────────────────────────────────
app.MapControllers();

// ─────────────────────────────────────────────────────────────
// Run
// - Arranca la aplicación web y bloquea el hilo principal.
// ─────────────────────────────────────────────────────────────
app.Run();
