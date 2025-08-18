// ============================================================================
// Infrastructure/Db2/DistribBenefInstitucionRepositoryDb2.cs
// ============================================================================
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Db2;

public sealed class DistribBenefInstitucionRepositoryDb2 : IDistribBenefInstitucionRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private string Table => $"{_schema}.T_OTRI_TT_DISTRIBBENEF_INSTITUCION";

    public DistribBenefInstitucionRepositoryDb2(IConfiguration cfg)
    {
        _connString = cfg.GetConnectionString("Db2")
                      ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2");
        _schema = cfg["Db2:Schema"] ?? "SOTRI";
    }

    public async Task<IReadOnlyList<DistribBenefInstitucion>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTDISTRIBBENEFINSTITUCION,
  IDOTRITTDISTRIBUCIONRESOLUCION,
  IDOTRITTBENEFINSTITUCION,
  IDUSUARIOCREA,
  IDUSUARIOMOD,
  PORCENTAJE,
  FECHACREACION,
  FECHAMODIFICA,
  ULTIMO_CAMBIO
FROM {Table}
ORDER BY IDOTRITTDISTRIBBENEFINSTITUCION";

        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;

        var list = new List<DistribBenefInstitucion>();
        await using var rd = await cmd.ExecuteReaderAsync(ct);
        while (await rd.ReadAsync(ct))
            list.Add(Map(rd));

        return list;
    }

    public async Task<DistribBenefInstitucion?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTDISTRIBBENEFINSTITUCION,
  IDOTRITTDISTRIBUCIONRESOLUCION,
  IDOTRITTBENEFINSTITUCION,
  IDUSUARIOCREA,
  IDUSUARIOMOD,
  PORCENTAJE,
  FECHACREACION,
  FECHAMODIFICA,
  ULTIMO_CAMBIO
FROM {Table}
WHERE IDOTRITTDISTRIBBENEFINSTITUCION = @id";

        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rd = await cmd.ExecuteReaderAsync(ct);
        if (await rd.ReadAsync(ct))
            return Map(rd);

        return null;
    }
    
    public async Task<int> CreateAsync(DistribBenefInstitucion e, CancellationToken ct = default)
{
    using var conn = new DB2Connection(_connString);
    await conn.OpenAsync(ct);
    using var tx = conn.BeginTransaction();

    try
    {
        // PK = MAX+1 si no vino
        if (e.IdDistribBenefInstitucion <= 0)
        {
            using var getId = conn.CreateCommand();
            getId.Transaction = tx;
            getId.CommandText = $@"SELECT COALESCE(MAX(IDOTRITTDISTRIBBENEFINSTITUCION),0)+1 FROM {Table}";
            var obj = await getId.ExecuteScalarAsync(ct);
            e.IdDistribBenefInstitucion = Convert.ToInt32(obj);
        }

        // Si la tabla exige NOT NULL en IDUSUARIOMOD, usamos el mismo que crea si no viene
        var idUsrModInsert = e.IdUsuarioMod ?? e.IdUsuarioCrea;
        // (Opcional) si también es NOT NULL en DDL, valida aquí:
        // if (idUsrModInsert == null) throw new InvalidOperationException("IDUSUARIOMOD requerido por la tabla.");

        using var cmd = conn.CreateCommand();
        cmd.Transaction = tx;
        cmd.CommandText = $@"
INSERT INTO {Table} (
  IDOTRITTDISTRIBBENEFINSTITUCION,
  IDOTRITTDISTRIBUCIONRESOLUCION,
  IDOTRITTBENEFINSTITUCION,
  IDUSUARIOCREA,
  IDUSUARIOMOD,
  PORCENTAJE,
  FECHACREACION,
  FECHAMODIFICA,
  ULTIMO_CAMBIO
) VALUES (
  @id,
  @idDistResol,
  @idBenefInst,
  @idUsrCrea,
  @idUsrMod,
  @porc,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)";

        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = e.IdDistribBenefInstitucion });
        cmd.Parameters.Add(new DB2Parameter("@idDistResol", DB2Type.Integer) { Value = e.IdDistribucionResolucion });
        cmd.Parameters.Add(new DB2Parameter("@idBenefInst", DB2Type.Integer) { Value = e.IdBenefInstitucion });

        cmd.Parameters.Add(new DB2Parameter("@idUsrCrea", DB2Type.Integer) { Value = (object?)e.IdUsuarioCrea ?? DBNull.Value });
        cmd.Parameters.Add(new DB2Parameter("@idUsrMod",  DB2Type.Integer) { Value = (object?)idUsrModInsert ?? DBNull.Value });

        // 🔧 CLAVE: tipar el DECIMAL (evita SQL0418)
        var p = new DB2Parameter("@porc", DB2Type.Decimal)
        {
            Precision = 8,  // ajusta a tu DDL si es diferente
            Scale     = 2,
            Value     = e.Porcentaje
        };
        cmd.Parameters.Add(p);

        var n = await cmd.ExecuteNonQueryAsync(ct);
        tx.Commit();

        if (n <= 0) throw new Exception("No se insertó el registro");
        return e.IdDistribBenefInstitucion;
    }
    catch
    {
        try { tx.Rollback(); } catch { /* ignore */ }
        throw;
    }
}

    public async Task<bool> UpdatePartialAsync(
        int id,
        int? idDistribucionResolucion,
        int? idBenefInstitucion,
        decimal? porcentaje,
        int? idUsuarioMod,
        CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sets = new List<string>();
        var parms = new List<DB2Parameter>();

        if (idDistribucionResolucion.HasValue)
        {
            sets.Add("IDOTRITTDISTRIBUCIONRESOLUCION = @idDistResol");
            parms.Add(new DB2Parameter("@idDistResol", DB2Type.Integer) { Value = idDistribucionResolucion.Value });
        }
        if (idBenefInstitucion.HasValue)
        {
            sets.Add("IDOTRITTBENEFINSTITUCION = @idBenefInst");
            parms.Add(new DB2Parameter("@idBenefInst", DB2Type.Integer) { Value = idBenefInstitucion.Value });
        }
        if (porcentaje.HasValue)
        {
            sets.Add("PORCENTAJE = @porc");
            var p = new DB2Parameter("@porc", DB2Type.Decimal)
            {
                Precision = 8, // ajusta a tu DDL
                Scale     = 2,
                Value     = porcentaje.Value
            };
            parms.Add(p);
        }
        if (idUsuarioMod.HasValue)
        {
            sets.Add("IDUSUARIOMOD = @idUsrMod");
            parms.Add(new DB2Parameter("@idUsrMod", DB2Type.Integer) { Value = idUsuarioMod.Value });
        }

        // Siempre actualizar FECHAMODIFICA y ULTIMO_CAMBIO
        sets.Add("FECHAMODIFICA = CURRENT_TIMESTAMP");
        sets.Add("ULTIMO_CAMBIO = CURRENT_TIMESTAMP");

        if (sets.Count == 0) return false;

        var sql = $@"
UPDATE {Table}
   SET {string.Join(", ", sets)}
 WHERE IDOTRITTDISTRIBBENEFINSTITUCION = @id";

        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        foreach (var prm in parms) cmd.Parameters.Add(prm);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var n = await cmd.ExecuteNonQueryAsync(ct);
        return n > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"DELETE FROM {Table} WHERE IDOTRITTDISTRIBBENEFINSTITUCION = @id";
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var n = await cmd.ExecuteNonQueryAsync(ct);
        return n > 0;
    }

    // --------------------------- Helpers ---------------------------
    
    private static DistribBenefInstitucion Map(DbDataReader rd)
    {
        int i = 0;

        var entity = new DistribBenefInstitucion
        {
            IdDistribBenefInstitucion = rd.GetInt32(i++),
            IdDistribucionResolucion  = rd.GetInt32(i++),
            IdBenefInstitucion        = rd.GetInt32(i++)
        };

        entity.IdUsuarioCrea  = rd.IsDBNull(i) ? null : rd.GetInt32(i); i++;
        entity.IdUsuarioMod   = rd.IsDBNull(i) ? null : rd.GetInt32(i); i++;
        entity.Porcentaje     = rd.GetDecimal(i++);
        entity.FechaCreacion  = rd.IsDBNull(i) ? null : rd.GetDateTime(i); i++;
        entity.FechaModifica  = rd.IsDBNull(i) ? null : rd.GetDateTime(i); i++;
        entity.UltimoCambio   = rd.IsDBNull(i) ? null : rd.GetDateTime(i);

        return entity;
    }


    
}
