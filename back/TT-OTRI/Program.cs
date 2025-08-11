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

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddCors(p => p.AddPolicy("Default", policy =>
{
    policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
}));

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

var app = builder.Build();

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

app.UseCors("Default");
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
