// ============================================================================
// Archivo: Program.cs
// Ubicación: TT-OTRI/Program.cs
// ============================================================================
using System.IdentityModel.Tokens.Jwt;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using TT_OTRI.Infrastructure;
using TT_OTRI.Infrastructure.Auth;
using TT_OTRI.Infrastructure.Cors;
using TT_OTRI.Infrastructure.Db2;
using TT_OTRI.Infrastructure.Swagger;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var cfg = builder.Configuration;

// Evitar mapeo automático de claims (recomendado)
JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

// Controllers + JSON
services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Infraestructura
services.AddInfrastructure(cfg);
services.AddDb2(cfg);

// Auth + CORS + Swagger
services.AddAppAuthentication(cfg);
services.AddAppCors(cfg);
services.AddAppSwagger();

var app = builder.Build();

// Swagger solo en dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS (opcional en dev; recomendado en prod)
app.UseHttpsRedirection();

// IMPORTANTE: orden del pipeline
// 1) CORS SIEMPRE antes de auth y endpoints
app.UseCors(CorsSetup.PolicyName);

// 2) Autenticación / Autorización
app.UseAuthentication();
app.UseAuthorization();

// 3) Preflight OPTIONS (genera 200 + headers CORS sin pasar por auth)
app.MapMethods("{*path}", new[] { "OPTIONS" }, () => Results.Ok()).AllowAnonymous();

// 4) Controllers (se exige CORS en todos los endpoints explícitamente)
app.MapControllers().RequireCors(CorsSetup.PolicyName);

app.Run();