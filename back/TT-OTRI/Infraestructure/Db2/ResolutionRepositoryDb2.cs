using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class ResolutionRepositoryDb2 : IResolutionRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_RESOLUCION";
    private string FQN => $"{_schema}.{TableName}";

    public ResolutionRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* ----------------------------- LECTURA ----------------------------- */

    public async Task<IEnumerable<Resolution>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTRESOLUCION, IDUSUARIO, COMPLETADO, CODIGO, TITULO, DESCRIPCION,
  ESTADO, FECHARESOLUCION, FECHAVIGENCIA, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTRESOLUCION DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<Resolution>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<Resolution?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTRESOLUCION, IDUSUARIO, COMPLETADO, CODIGO, TITULO, DESCRIPCION,
  ESTADO, FECHARESOLUCION, FECHAVIGENCIA, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTRESOLUCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    /* ----------------------------- ESCRITURA --------------------------- */

    public async Task AddAsync(Resolution r, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        // Síncrono para tipo fuerte? No hace falta: DbTransaction funciona.
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDUSUARIO, COMPLETADO, CODIGO, TITULO, DESCRIPCION, ESTADO,
  FECHARESOLUCION, FECHAVIGENCIA, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idusuario, @completado, @codigo, @titulo, @descripcion, @estado,
  @fresol, @fvig, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx; // El objeto real es DB2Transaction
                cmd.Parameters.Add(new DB2Parameter("@idusuario",  DB2Type.Integer)  { Value = r.IdUsuario });
                cmd.Parameters.Add(new DB2Parameter("@completado", DB2Type.SmallInt) { Value = BoolToSmallInt(r.Completed) });
                cmd.Parameters.Add(new DB2Parameter("@codigo",     DB2Type.VarChar)  { Value = (object)r.Codigo ?? string.Empty });
                cmd.Parameters.Add(new DB2Parameter("@titulo",     DB2Type.VarChar)  { Value = (object)r.Titulo ?? string.Empty });
                cmd.Parameters.Add(new DB2Parameter("@descripcion",DB2Type.VarChar)  { Value = (object)r.Descripcion ?? string.Empty });
                cmd.Parameters.Add(new DB2Parameter("@estado",     DB2Type.Char)     { Value = (char)r.Estado });
                cmd.Parameters.Add(new DB2Parameter("@fresol", DB2Type.Date)
                {
                    Value = r.FechaResolucion.HasValue ? r.FechaResolucion.Value.Date : DBNull.Value
                });
                cmd.Parameters.Add(new DB2Parameter("@fvig", DB2Type.Date)
                {
                    Value = r.FechaVigencia.HasValue ? r.FechaVigencia.Value.Date : DBNull.Value
                });
                await cmd.ExecuteNonQueryAsync(ct);
            }

            // ID autogenerado
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                r.Id = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            // Leer los timestamps reales tras commit (sin pasar transacción)
            var back = await GetByIdAsync(r.Id, ct);
            if (back != null)
            {
                r.CreatedAt = back.CreatedAt;
                r.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                // fallback seguro
                r.CreatedAt = r.UpdatedAt = DateTime.UtcNow;
            }
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(Resolution r, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
  IDUSUARIO       = @idusuario,
  COMPLETADO      = @completado,
  CODIGO          = @codigo,
  TITULO          = @titulo,
  DESCRIPCION     = @descripcion,
  ESTADO          = @estado,
  FECHARESOLUCION = @fresol,
  FECHAVIGENCIA   = @fvig,
  ULTIMO_CAMBIO   = CURRENT TIMESTAMP
WHERE IDOTRITTRESOLUCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idusuario",  DB2Type.Integer)  { Value = r.IdUsuario });
        cmd.Parameters.Add(new DB2Parameter("@completado", DB2Type.SmallInt) { Value = BoolToSmallInt(r.Completed) });
        cmd.Parameters.Add(new DB2Parameter("@codigo",     DB2Type.VarChar)  { Value = (object)r.Codigo ?? string.Empty });
        cmd.Parameters.Add(new DB2Parameter("@titulo",     DB2Type.VarChar)  { Value = (object)r.Titulo ?? string.Empty });
        cmd.Parameters.Add(new DB2Parameter("@descripcion",DB2Type.VarChar)  { Value = (object)r.Descripcion ?? string.Empty });
        cmd.Parameters.Add(new DB2Parameter("@estado",     DB2Type.Char)     { Value = (char)r.Estado });
        cmd.Parameters.Add(new DB2Parameter("@fresol", DB2Type.Date)
        {
            Value = r.FechaResolucion.HasValue ? r.FechaResolucion.Value.Date : DBNull.Value
        });
        cmd.Parameters.Add(new DB2Parameter("@fvig", DB2Type.Date)
        {
            Value = r.FechaVigencia.HasValue ? r.FechaVigencia.Value.Date : DBNull.Value
        });
        cmd.Parameters.Add(new DB2Parameter("@id",         DB2Type.Integer)  { Value = r.Id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) throw new KeyNotFoundException($"Resolution {r.Id} no existe.");

        // sincronizar UpdatedAt real
        var back = await GetByIdAsync(r.Id, ct);
        if (back != null) r.UpdatedAt = back.UpdatedAt;
    }

    /* --------------------------- HELPERS -------------------------------- */

    private static Resolution MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new Resolution
        {
            Id              = rec.GetInt32 (Ord("IDOTRITTRESOLUCION")),
            IdUsuario       = rec.GetInt32 (Ord("IDUSUARIO")),
            Completed       = Convert.ToInt16(rec.GetValue(Ord("COMPLETADO"))) != 0,
            Codigo          = rec["CODIGO"]       as string ?? string.Empty,
            Titulo          = rec["TITULO"]       as string ?? string.Empty,
            Descripcion     = rec["DESCRIPCION"]  as string ?? string.Empty,
            Estado          = (ResolutionStatus) Convert.ToChar(rec["ESTADO"]),
            FechaResolucion = (DateTime) rec["FECHARESOLUCION"],
            FechaVigencia   = (DateTime) rec["FECHAVIGENCIA"],
            CreatedAt       = (DateTime) rec["FECHACREACION"],
            UpdatedAt       = (DateTime) rec["ULTIMO_CAMBIO"]
        };
    }

    private static short BoolToSmallInt(bool b) => b ? (short)1 : (short)0;
}
