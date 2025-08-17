// ============================================================================
// File: Infrastructure/Db2/PersonLookupRepositoryDb2.cs
// Descripción:
//   Repositorio DB2 para búsquedas de persona por email.
//   - Resuelve la cadena de conexión desde varias fuentes (Db2, Db2_NoSSL, ENV).
//   - Usa parámetros posicionales (?) en DB2 para máxima compatibilidad.
//   - Incluye XML docs y manejo de cancelación.
// Requisitos de configuración:
//   - ConnectionStrings:Db2 (recomendado) o
//   - ConnectionStrings:Db2_NoSSL o
//   - ENV DB2_CONNSTRING
//   - Db2:Schema (opcional; por defecto "ESPOL").
// ============================================================================
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Db2
{
    /// <summary>
    /// Implementación DB2 de <see cref="IPersonLookupRepository"/> para obtener el ID de persona por email.
    /// </summary>
    public sealed class PersonLookupRepositoryDb2 : IPersonLookupRepository
    {
        private readonly string _connString;
        private readonly string _schema;

        /// <summary>
        /// Crea el repositorio resolviendo la cadena de conexión desde:
        /// ConnectionStrings:Db2 → ConnectionStrings:Db2_NoSSL → ENV DB2_CONNSTRING.
        /// </summary>
        /// <param name="cfg">Configuración de la aplicación.</param>
        /// <exception cref="InvalidOperationException">Si no se encuentra ninguna cadena de conexión válida.</exception>
        public PersonLookupRepositoryDb2(IConfiguration cfg)
        {
            var cs1 = cfg.GetConnectionString("Db2");
            var cs2 = cfg.GetConnectionString("Db2_NoSSL");
            var cs3 = Environment.GetEnvironmentVariable("DB2_CONNSTRING");

            _connString = FirstNonEmpty(cs1, cs2, cs3)
                          ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2 (o Db2_NoSSL) o variable de entorno DB2_CONNSTRING");

            _schema = cfg["Db2:Schema"] ?? "ESPOL";
        }

        /// <summary>
        /// Retorna el IDPERSONA para el <paramref name="email"/> dado, o <c>null</c> si no existe coincidencia exacta.
        /// </summary>
        /// <param name="email">Email a buscar (no sensible a mayúsculas/minúsculas).</param>
        /// <param name="ct">Token de cancelación.</param>
        /// <returns>El IDPERSONA o <c>null</c> si no hay coincidencia.</returns>
        public async Task<int?> GetPersonIdByEmailAsync(string email, CancellationToken ct = default)
        {
            // Validación rápida
            if (string.IsNullOrWhiteSpace(email)) return null;

            var emailNorm = email.Trim();
            if (emailNorm.Length == 0) return null;

            // IMPORTANTE EN DB2:
            // - Usar "?" como marcador posicional en el SQL.
            // - Agregar parámetros en el mismo orden (posición) en DB2Command.Parameters.
            var sql = $@"
SELECT IDPERSONA
FROM {_schema}.TBL_PERSONA
WHERE LOWER(EMAIL) = LOWER(?)
FETCH FIRST 1 ROWS ONLY";

            await using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            await using var cmd = new DB2Command(sql, conn);
            // Nombre del parámetro no aparece en el SQL (marcador posicional),
            // pero es requerido por la API. El orden es lo que manda.
            cmd.Parameters.Add(new DB2Parameter("email", DB2Type.VarChar) { Value = emailNorm });

            object? scalar;
            try
            {
                scalar = await cmd.ExecuteScalarAsync(ct);
            }
            catch (DB2Exception ex)
            {
                // Aquí puedes registrar/loggear si lo prefieres
                // throw; // Si quieres propagar el error original
                // Retornamos null para "no encontrado" solo si lo consideras apropiado;
                // por defecto, preferimos propagar.
                throw new InvalidOperationException("Error ejecutando consulta de persona por email en DB2.", ex);
            }

            if (scalar is null || scalar is DBNull) return null;
            return Convert.ToInt32(scalar);
        }

        /// <summary>
        /// Retorna el primer string no vacío/nulo.
        /// </summary>
        private static string? FirstNonEmpty(params string?[] xs) =>
            xs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));
    }
}
