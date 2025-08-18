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

// Evitar mapeo automático de claims (opcional, recomendado)
JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// 🔧 REGISTRA servicios y repos por convención
services.AddInfrastructure(cfg);

services.AddDb2(cfg);
services.AddAppAuthentication(cfg);
services.AddAppCors(cfg);
services.AddAppSwagger();

var app = builder.Build();

app.UseCors(CorsSetup.PolicyName);
app.UseAuthentication();
app.UseAuthorization();

// ✅ Permite preflight sin auth (evita 401/403 en OPTIONS)
app.MapMethods("{*any}", new[] { "OPTIONS" }, () => Results.Ok())
    .AllowAnonymous();

// ✅ No fuerces auth aquí; deja que la política por defecto lo haga
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();