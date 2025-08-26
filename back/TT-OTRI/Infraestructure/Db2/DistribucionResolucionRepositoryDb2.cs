// ============================================================================
// Infrastructure/Db2/DistribucionResolucionRepositoryDb2.cs
// ============================================================================
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Db2;

public sealed class DistribucionResolucionRepositoryDb2 : IDistribucionResolucionRepository
{
    private readonly string _connString;
    private readonly string _schema;

    public DistribucionResolucionRepositoryDb2(IConfiguration cfg)
    {
        _connString = cfg.GetConnectionString("Db2")
                      ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2");
        _schema = "SOTRI";
    }

    private string Table => $"{_schema}.T_OTRI_TT_DISTRIBUCIONRESOLUCION";

    public async Task<IReadOnlyList<DistribucionResolucionDto>> GetByResolucionAsync(int idResolucion, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTDISTRIBUCIONRESOLUCION,
  IDOTRITTRESOLUCION,
  MONTOMAXIMO, MONTOMINIMO,
  PORCSUBTOTALAUTORES, PORCSUBTOTALINSTITUT,
  IDUSUARIOCREA, IDUSUARIOMOD,
  FECHACREACION, FECHAMODIFICA, ULTIMO_CAMBIO
FROM {Table}
WHERE IDOTRITTRESOLUCION = @id
ORDER BY IDOTRITTDISTRIBUCIONRESOLUCION";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", idResolucion));

        var list = new List<DistribucionResolucionDto>();
        using var rd = await cmd.ExecuteReaderAsync(ct);
        while (await rd.ReadAsync(ct))
        {
            list.Add(ReadDto(rd));
        }
        return list;
    }

    public async Task<DistribucionResolucionDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTDISTRIBUCIONRESOLUCION,
  IDOTRITTRESOLUCION,
  MONTOMAXIMO, MONTOMINIMO,
  PORCSUBTOTALAUTORES, PORCSUBTOTALINSTITUT,
  IDUSUARIOCREA, IDUSUARIOMOD,
  FECHACREACION, FECHAMODIFICA, ULTIMO_CAMBIO
FROM {Table}
WHERE IDOTRITTDISTRIBUCIONRESOLUCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", id));

        using var rd = await cmd.ExecuteReaderAsync(ct);
        if (await rd.ReadAsync(ct))
            return ReadDto(rd);

        return null;
    }

    public async Task<int> CreateAsync(int idResolucion, CreateDistribucionResolucionDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
INSERT INTO {Table}
    (IDOTRITTRESOLUCION,
     MONTOMAXIMO, MONTOMINIMO,
     PORCSUBTOTALAUTORES, PORCSUBTOTALINSTITUT,
     IDUSUARIOCREA, FECHACREACION)
VALUES
    (@idRes, @max, @min, @porcAut, @porcInst, @uCrea, CURRENT_TIMESTAMP)";

        using (var cmd = new DB2Command(sql, conn))
        {
            cmd.Parameters.Add(new DB2Parameter("@idRes", idResolucion));

            // ✅ Enviar NULL cuando no hay máximo
            cmd.Parameters.Add(new DB2Parameter("@max", (object?)dto.MontoMaximo ?? DBNull.Value));

            // MontoMinimo se mantiene requerido (decimal no nulo)
            cmd.Parameters.Add(new DB2Parameter("@min", dto.MontoMinimo));

            cmd.Parameters.Add(new DB2Parameter("@porcAut", dto.PorcSubtotalAutores));
            cmd.Parameters.Add(new DB2Parameter("@porcInst", dto.PorcSubtotalInstitut));
            cmd.Parameters.Add(new DB2Parameter("@uCrea", (object?)dto.IdUsuarioCrea ?? DBNull.Value));

            await cmd.ExecuteNonQueryAsync(ct);
        }

        using var cmdId = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
        var raw = await cmdId.ExecuteScalarAsync(ct);
        return Convert.ToInt32(raw);
    }

// Infrastructure/Db2/DistribucionResolucionRepositoryDb2.cs
    public async Task<bool> PatchAsync(int id, PatchDistribucionResolucionDto dto, CancellationToken ct = default)
    {
        var sets = new List<string>();
        var parms = new List<DB2Parameter>();

        void Add<T>(string column, string pname, T? value) where T : struct
        {
            if (value.HasValue)
            {
                sets.Add($"{column} = {pname}");
                parms.Add(new DB2Parameter(pname, value.Value));
            }
        }

        // --- MONTOMAXIMO ---
        if (dto.SetMontoMaximoNull == true)
        {
            sets.Add("MONTOMAXIMO = NULL");  // <— fuerza NULL
        }
        else
        {
            Add("MONTOMAXIMO", "@max", dto.MontoMaximo);
        }

        // --- resto de campos ---
        Add("MONTOMINIMO",          "@min",   dto.MontoMinimo);
        Add("PORCSUBTOTALAUTORES",  "@paut",  dto.PorcSubtotalAutores);
        Add("PORCSUBTOTALINSTITUT", "@pinst", dto.PorcSubtotalInstitut);

        if (dto.IdUsuarioMod.HasValue)
        {
            sets.Add("IDUSUARIOMOD = @umod");
            parms.Add(new DB2Parameter("@umod", dto.IdUsuarioMod.Value));
        }

        sets.Add("FECHAMODIFICA = CURRENT_TIMESTAMP");

        if (sets.Count == 1 && !dto.IdUsuarioMod.HasValue)
            return false;

        var sql = $@"UPDATE {Table}
SET {string.Join(", ", sets)}
WHERE IDOTRITTDISTRIBUCIONRESOLUCION = @id";

        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        using var cmd = new DB2Command(sql, conn);
        foreach (var p in parms) cmd.Parameters.Add(p);
        cmd.Parameters.Add(new DB2Parameter("@id", id));

        var n = await cmd.ExecuteNonQueryAsync(ct);
        return n > 0;
    }

    // ✅ Refleja null reales desde DB
    private static DistribucionResolucionDto ReadDto(DbDataReader rd) => new()
    {
        Id                   = rd.GetInt32(0),
        IdResolucion         = rd.GetInt32(1),
        MontoMaximo          = rd.IsDBNull(2) ? (decimal?)null : rd.GetDecimal(2),
        MontoMinimo          = rd.GetDecimal(3),
        PorcSubtotalAutores  = rd.IsDBNull(4) ? 0m : rd.GetDecimal(4),
        PorcSubtotalInstitut = rd.IsDBNull(5) ? 0m : rd.GetDecimal(5),
        IdUsuarioCrea        = rd.IsDBNull(6) ? (int?)null : rd.GetInt32(6),
        IdUsuarioMod         = rd.IsDBNull(7) ? (int?)null : rd.GetInt32(7),
        FechaCreacion        = rd.IsDBNull(8) ? (DateTime?)null : rd.GetDateTime(8),
        FechaModifica        = rd.IsDBNull(9) ? (DateTime?)null : rd.GetDateTime(9),
        UltimoCambio         = rd.IsDBNull(10) ? (DateTime?)null : rd.GetDateTime(10),
    };
}
