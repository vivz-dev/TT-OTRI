// ============================================================================
// Infrastructure/Repositories/UnidadRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class UnidadRepositoryDb2 : IUnidadRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "TBL_UNIDAD";
    private string FQN => $"{_schema}.{TableName}";

    public UnidadRepositoryDb2(IConfiguration cfg)
    {
        // Puedes cambiar a lectura desde configuración si ya usas AddDb2(cfg)
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "ESPOL"; // <- ✅ ahora ESPOL
    }

    public async Task<IReadOnlyList<Unidad>> GetAllActivasAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // DISTINCT por si hay duplicados; filtra solo ESTADO='A'
        var sql = $@"
SELECT DISTINCT
  IDUNIDAD, NOMBREUNIDAD
FROM {FQN}
WHERE ESTADO = 'A'
ORDER BY NOMBREUNIDAD";

        using var cmd  = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct); // ✅ evita el cast error

        var list = new List<Unidad>();
        while (await rdr.ReadAsync(ct))
            list.Add(Map(rdr));

        return list;
    }

    public async Task<Unidad?> GetByIdActivaAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDUNIDAD, NOMBREUNIDAD
FROM {FQN}
WHERE ESTADO = 'A' AND IDUNIDAD = @id
FETCH FIRST 1 ROW ONLY";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.SmallInt) { Value = (short)id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct); // ✅ evita el cast error
        if (await rdr.ReadAsync(ct))
            return Map(rdr);

        return null;
    }

    /* ----------------------------- helpers ----------------------------- */
    private static Unidad Map(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);
        // IDUNIDAD: SMALLINT -> Int16
        var id = Convert.ToInt32(rec.GetValue(Ord("IDUNIDAD")));
        var nombre = rec["NOMBREUNIDAD"] as string ?? string.Empty;

        return new Unidad
        {
            IdUnidad = id,
            NombreUnidad = nombre
        };
    }
}
