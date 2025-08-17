// ============================================================================
// File: Infrastructure/Db2/RoleLinkRepositoryDb2.cs
// ============================================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Db2
{
    public sealed class RoleLinkRepositoryDb2 : IRoleLinkRepository
    {
        private readonly string _connString;
        private readonly string _schema;

        public RoleLinkRepositoryDb2(IConfiguration cfg)
        {
            var cs1 = cfg.GetConnectionString("Db2");
            var cs2 = cfg.GetConnectionString("Db2_NoSSL");
            var cs3 = Environment.GetEnvironmentVariable("DB2_CONNSTRING");

            _connString = FirstNonEmpty(cs1, cs2, cs3)
                          ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2 (o Db2_NoSSL) o variable de entorno DB2_CONNSTRING");

            _schema = cfg["Db2:Schema"] ?? "ESPOL";
        }

        public async Task<IReadOnlyList<int>> GetRoleIdsByPersonIdAsync(int idPersona, CancellationToken ct = default)
        {
            var sql = $@"
SELECT DISTINCT IDROLES
FROM {_schema}.TBL_ROL_PERSONA
WHERE IDPERSONA = ?";

            var result = new List<int>(capacity: 4);

            await using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            await using var cmd = new DB2Command(sql, conn);
            cmd.Parameters.Add(new DB2Parameter("idPersona", DB2Type.Integer) { Value = idPersona });

            try
            {
                await using var rdr = await cmd.ExecuteReaderAsync(ct);
                while (await rdr.ReadAsync(ct))
                {
                    if (rdr.IsDBNull(0)) continue;

                    // ✅ Lectura tolerante (SMALLINT/INTEGER)
                    var val = Convert.ToInt32(rdr.GetValue(0));
                    result.Add(val);
                }
            }
            catch (DB2Exception ex)
            {
                throw new InvalidOperationException("Error ejecutando consulta de roles por persona en DB2.", ex);
            }

            return result.AsReadOnly();
        }

        private static string? FirstNonEmpty(params string?[] xs) =>
            xs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));
    }
}
