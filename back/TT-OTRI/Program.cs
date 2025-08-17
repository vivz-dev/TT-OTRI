// ============================================================================
// Program.cs (.NET 8) — EntraIdExchange (solo /api/auth/exchange) + AppJwt (resto)
// ============================================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Linq; // <- necesario para FirstOrDefault en FirstNonEmpty
using IBM.Data.Db2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Application.Services;
using TT_OTRI.Infrastructure;
using TT_OTRI.Infrastructure.Db2;
using TT_OTRI.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var cfg = builder.Configuration;

JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

// --- DB2: normalización de ConnectionStrings:Db2 ---
var envVar = Environment.GetEnvironmentVariable("DB2_CONNSTRING");
var cfgDb2  = builder.Configuration.GetConnectionString("Db2");
var cfgDb2n = builder.Configuration.GetConnectionString("Db2_NoSSL");

// Si falta ConnectionStrings:Db2, lo rellenamos con la mejor disponible
if (string.IsNullOrWhiteSpace(cfgDb2))
{
    var effective = !string.IsNullOrWhiteSpace(cfgDb2n) ? cfgDb2n : envVar;
    if (!string.IsNullOrWhiteSpace(effective))
    {
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:Db2"] = effective
        });
        Console.WriteLine("↪️  ConnectionStrings:Db2 suplida desde Db2_NoSSL/ENV.");
    }
}

// Dump de diagnóstico
Console.WriteLine("== Config dump ==");
Console.WriteLine($"ENV.DB2_CONNSTRING len: {envVar?.Length ?? 0}");
// Console.WriteLine($"CFG.ConnectionStrings:Db2 len: {builder.Configuration.GetConnectionString(\"Db2\")?.Length ?? 0}");
// Console.WriteLine($"CFG.Data:Provider: {cfg[\"Data:Provider\"] ?? \"(null)\"}");

// Registra DB2Connection SIEMPRE con la cadena efectiva ya normalizada
services.AddScoped(sp =>
{
    var cs = sp.GetRequiredService<IConfiguration>().GetConnectionString("Db2")
          ?? throw new InvalidOperationException("No hay cadena de conexión DB2 (ConnectionStrings:Db2).");
    return new DB2Connection(cs);
});

// Controllers + JSON
services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Infra (escaneo por convención, depende de Data:Provider)
services.AddInfrastructure(builder.Configuration);

// --- CORS (ajusta orígenes de tu SPA) ---
const string corsPolicy = "_otriCors";
services.AddCors(opt =>
{
    opt.AddPolicy(corsPolicy, p => p
        .WithOrigins("http://localhost:3000", "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ====================== AUTH ======================
const string azureScheme = "EntraIdExchange";
const string appScheme   = "AppJwt";

// ⚙️ Entra ID (para validar el token de AAD SOLO en /api/auth/exchange)
var azureTenantId     = cfg["AzureAd:TenantId"];
var azureInstance     = cfg["AzureAd:Instance"] ?? "https://login.microsoftonline.com/";
var azureAudienceUri  = cfg["AzureAd:Audience"];  // api://<API_APP_ID_URI> (recomendado)
var azureApiClientId  = cfg["AzureAd:ClientId"];  // <API_APP_ID> (GUID) (alternativo)
string azureV2Issuer  = $"{azureInstance}{azureTenantId}/v2.0";
string azureV1Issuer  = $"https://sts.windows.net/{azureTenantId}/";

// ⚙️ Tu JWT interno
var appIssuer   = cfg["AppJwt:Issuer"]   ?? "tt-otri-api";
var appAudience = cfg["AppJwt:Audience"] ?? "tt-otri-api";
var signingKey  = cfg["AppJwt:SigningKey"] ?? throw new InvalidOperationException("Falta AppJwt:SigningKey");
var appKey      = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));

services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = appScheme; // por defecto, tu JWT
        options.DefaultChallengeScheme    = appScheme;
    })
    // 1) Azure AD (Entra ID) — solo para /api/auth/exchange
    .AddJwtBearer(azureScheme, options =>
    {
        options.Authority = $"{azureInstance}{azureTenantId}/v2.0";
        options.RequireHttpsMetadata = true;

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine($"{azureScheme} Auth FAILED: {ctx.Exception?.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {
                var p = ctx.Principal;
                var aud = p?.FindFirst("aud")?.Value ?? "";
                var iss = p?.FindFirst("iss")?.Value ?? "";
                var tid = p?.FindFirst("tid")?.Value ?? "";
                Console.WriteLine($"{azureScheme} OK - aud={aud} iss={iss} tid={tid}");
                return Task.CompletedTask;
            }
        };

        var validAudiences = new List<string>();
        if (!string.IsNullOrWhiteSpace(azureAudienceUri)) validAudiences.Add(azureAudienceUri);
        if (!string.IsNullOrWhiteSpace(azureApiClientId)) validAudiences.Add(azureApiClientId);

        var validIssuers = new List<string>();
        if (!string.IsNullOrWhiteSpace(azureV2Issuer)) validIssuers.Add(azureV2Issuer);
        if (!string.IsNullOrWhiteSpace(azureV1Issuer)) validIssuers.Add(azureV1Issuer);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = validIssuers,
            ValidateAudience = true,
            ValidAudiences = validAudiences,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
            NameClaimType = "name",
            RoleClaimType = "roles"
        };
    })
    // 2) Tu JWT interno (HS256) — para TODO lo demás
    .AddJwtBearer(appScheme, options =>
    {
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = appIssuer,
            ValidateAudience = true,
            ValidAudience = appAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = appKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
    });

services.AddAuthorization(options =>
{
    options.AddPolicy("AppJwtOnly",
        policy => policy.AddAuthenticationSchemes(appScheme).RequireAuthenticatedUser());
});

// --- Swagger (JWT de la app) ---
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TT-OTRI API", Version = "v1" });

    // Esquema para TU JWT interno (el que usarán casi todas las rutas)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese: Bearer {token} (TU App JWT)"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(corsPolicy);
app.UseAuthentication();
app.UseAuthorization();

// ===== Public endpoints (sin AppJwt) =====
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
        return Results.Problem(ex.ToString());
    }
});

// ====== AUTH EXCHANGE: SOLO AAD ======
app.MapPost("/api/auth/exchange", (HttpContext http) =>
{
    var user = http.User;
    if (!(user?.Identity?.IsAuthenticated ?? false))
        return Results.Unauthorized();

    static string? GetTid(ClaimsPrincipal u)
    {
        var tid = u.FindFirst("tid")?.Value
            ?? u.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
        if (!string.IsNullOrWhiteSpace(tid)) return tid;

        var iss = u.FindFirst("iss")?.Value;
        if (!string.IsNullOrWhiteSpace(iss) &&
            iss.StartsWith("https://sts.windows.net/", StringComparison.OrdinalIgnoreCase))
        {
            var start = "https://sts.windows.net/".Length;
            var end = iss.IndexOf('/', start);
            if (end > start) return iss.Substring(start, end - start);
        }
        return null;
    }

    static string? GetEmail(ClaimsPrincipal u)
    {
        string? v;
        v = u.FindFirst("preferred_username")?.Value;
        if (!string.IsNullOrWhiteSpace(v) && v.Contains("@")) return v;
        v = u.FindFirst("upn")?.Value;
        if (!string.IsNullOrWhiteSpace(v) && v.Contains("@")) return v;
        v = u.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
        if (!string.IsNullOrWhiteSpace(v)) return v;
        v = u.FindFirst(ClaimTypes.Email)?.Value
         ?? u.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
        if (!string.IsNullOrWhiteSpace(v)) return v;
        v = u.FindFirst("unique_name")?.Value;
        if (!string.IsNullOrWhiteSpace(v) && v.Contains("@")) return v;
        v = u.FindFirst("emails")?.Value;
        return v;
    }

    static string FirstNonEmpty(params string?[] xs) =>
        xs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s)) ?? string.Empty;

    var oid   = FirstNonEmpty(user.FindFirstValue("oid"),
                              user.FindFirstValue(ClaimTypes.NameIdentifier),
                              Guid.NewGuid().ToString());
    var name  = FirstNonEmpty(user.FindFirstValue("name"), user.Identity?.Name, "Usuario");
    var email = FirstNonEmpty(GetEmail(user));
    var upn   = !string.IsNullOrWhiteSpace(email) ? email : FirstNonEmpty(user.FindFirst("unique_name")?.Value, "desconocido");
    var tid   = GetTid(user) ?? string.Empty;

    // TODO: mapear roles reales desde DB si aplica
    var roles = new[] { "user" };

    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, oid),
        new Claim(JwtRegisteredClaimNames.Name, name),
        new Claim(JwtRegisteredClaimNames.UniqueName, upn),
        new Claim(JwtRegisteredClaimNames.Email, email),
        new Claim("email", email),
        new Claim("tid", tid),
        new Claim("source", "msal"),
    };
    foreach (var r in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, r));
        claims.Add(new Claim("roles", r));
    }

    var creds = new SigningCredentials(appKey, SecurityAlgorithms.HmacSha256);
    var jwt = new JwtSecurityToken(
        issuer: appIssuer,
        audience: appAudience,
        claims: claims,
        notBefore: DateTime.UtcNow,
        expires: DateTime.UtcNow.AddMinutes(30),
        signingCredentials: creds
    );

    var token = new JwtSecurityTokenHandler().WriteToken(jwt);
    return Results.Ok(new { token });
})
.RequireAuthorization(new AuthorizeAttribute { AuthenticationSchemes = azureScheme });

// ===== Controllers: SOLO AppJwt =====
app.MapControllers().RequireAuthorization("AppJwtOnly");

app.Run();
