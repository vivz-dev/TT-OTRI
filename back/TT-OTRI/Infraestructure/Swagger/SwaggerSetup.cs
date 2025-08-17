// ============================================================================
// Archivo: SwaggerSetup.cs
// Ubicación: TT-OTRI/Infrastructure/Swagger/SwaggerSetup.cs
// Descripción:
//   Clase estática que extiende IServiceCollection para registrar y configurar
//   Swagger/OpenAPI en la aplicación TT-OTRI.
//
// Propósito:
//   - Exponer la documentación interactiva de la API en formato OpenAPI (Swagger).
//   - Facilitar pruebas de endpoints desde la interfaz Swagger UI.
//   - Documentar el esquema de autenticación mediante JWT (Bearer Token).
//
// Funcionamiento:
//   1. Se registra Swagger con un documento base (v1).
//   2. Se define un esquema de seguridad tipo "Bearer" para tokens JWT:
//        - Nombre del header: "Authorization".
//        - Esquema: bearer (formato JWT).
//        - Ubicación: cabecera HTTP.
//        - Descripción: instrucción de uso ("Bearer {token}").
//   3. Se establece como requisito de seguridad global para todos los endpoints.
//   4. La interfaz Swagger UI estará disponible en:
//        • Desarrollo: http://localhost:<puerto>/swagger
//
// Uso típico:
//   - Registrar en Program.cs:
//        services.AddAppSwagger();
//   - Activar en entorno de desarrollo:
//        if (app.Environment.IsDevelopment())
//        {
//            app.UseSwagger();
//            app.UseSwaggerUI();
//        }
//
// Notas:
//   - El esquema "Bearer" permite probar endpoints protegidos ingresando el JWT.
//   - Es recomendable deshabilitar Swagger en producción o protegerlo con autenticación.
// ============================================================================

using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace TT_OTRI.Infrastructure.Swagger;

public static class SwaggerSetup
{
    /// <summary>
    /// Registra y configura Swagger/OpenAPI con esquema de seguridad JWT.
    /// </summary>
    /// <param name="services">Contenedor de servicios de la aplicación.</param>
    /// <returns>La colección de servicios extendida.</returns>
    public static IServiceCollection AddAppSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            // Documento base OpenAPI
            c.SwaggerDoc("v1", new OpenApiInfo 
            { 
                Title = "TT-OTRI API", 
                Version = "v1" 
            });

            // Definición de seguridad JWT (Bearer)
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Ingrese: Bearer {token} (App JWT)"
            });

            // Requisito global de seguridad
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference 
                        { 
                            Type = ReferenceType.SecurityScheme, 
                            Id = "Bearer" 
                        }
                    },
                    new List<string>()
                }
            });
        });

        return services;
    }
}
