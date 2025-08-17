// ============================================================================
// File: Infrastructure/Db2/RoleCatalogRepositoryDb2.cs
// Descripción:
//   Catálogo de roles por IDs (DB2) con parámetros posicionales y nombres únicos.
// ============================================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Db2
{
    public sealed class RoleCatalogRepositoryDb2 : IRoleCatalogRepository
    {
        private readonly string _connString;
        private readonly string _schema;

        public RoleCatalogRepositoryDb2(IConfiguration cfg)
        {
            var cs1 = cfg.GetConnectionString("Db2");
            var cs2 = cfg.GetConnectionString("Db2_NoSSL");
            var cs3 = Environment.GetEnvironmentVariable("DB2_CONNSTRING");

            _connString = FirstNonEmpty(cs1, cs2, cs3)
                          ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2 (o Db2_NoSSL) o variable de entorno DB2_CONNSTRING");

            _schema = cfg["Db2:Schema"] ?? "ESPOL";
        }

        public async Task<IReadOnlyList<RoleDto>> GetRolesByIdsAsync(IEnumerable<int> ids, CancellationToken ct = default)
        {
            var list = ids?.Distinct().ToList() ?? new();
            if (list.Count == 0) return Array.Empty<RoleDto>();

            // IN (?, ?, ?, ...)
            var placeholders = string.Join(", ", Enumerable.Repeat("?", list.Count));

            var sql = $@"
SELECT IDROLES, NOMBRE
FROM {_schema}.TBL_ROL
WHERE IDROLES IN ({placeholders})
ORDER BY NOMBRE";

            var result = new List<RoleDto>(capacity: list.Count);

            await using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            await using var cmd = new DB2Command(sql, conn);

            // ⚠️ Nombres únicos por parámetro aunque el SQL sea posicional.
            for (int i = 0; i < list.Count; i++)
            {
                var pid = $"p{i}";
                // IDROLES es SMALLINT en DB2; enviamos como SmallInt
                cmd.Parameters.Add(new DB2Parameter(pid, DB2Type.SmallInt) { Value = list[i] });
            }

            try
            {
                await using var rdr = await cmd.ExecuteReaderAsync(ct);
                while (await rdr.ReadAsync(ct))
                {
                    var id = Convert.ToInt32(rdr.GetValue(0));              // tolerante SMALLINT/INTEGER
                    var nombre = rdr.IsDBNull(1) ? string.Empty : rdr.GetString(1);
                    result.Add(new RoleDto(id, nombre));
                }
            }
            catch (DB2Exception ex)
            {
                throw new InvalidOperationException("Error ejecutando consulta de catálogo de roles en DB2.", ex);
            }

            return result.AsReadOnly();
        }

        private static string? FirstNonEmpty(params string?[] xs) =>
            xs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));
    }
}
