using System.Data;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class TecnologiaRepositoryDb2 : ITecnologiaRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_TECNOLOGIA";
    private string FQN => $"{_schema}.{TableName}";

    public TecnologiaRepositoryDb2(IConfiguration cfg)
    {
        _connString = cfg.GetConnectionString("Db2") 
            ?? "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<Tecnologia>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTTECNOLOGIA, IDPERSONA, COMPLETADO, COTITULARIDAD, TITULO, DESCRIPCION, ESTADO, 
  FECHACREACION, ULTIMO_CAMBIO 
FROM {FQN} 
ORDER BY IDOTRITTTECNOLOGIA DESC";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;

        var list = new List<Tecnologia>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<Tecnologia?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTTECNOLOGIA, IDPERSONA, COMPLETADO, COTITULARIDAD, TITULO, DESCRIPCION, ESTADO, 
  FECHACREACION, ULTIMO_CAMBIO 
FROM {FQN} 
WHERE IDOTRITTTECNOLOGIA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task AddAsync(Tecnologia t, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN} (
  IDPERSONA, COMPLETADO, COTITULARIDAD, TITULO, DESCRIPCION, ESTADO
) VALUES (
  @idPersona, @completado, @cotitularidad, @titulo, @descripcion, @estado
)";

            using (var cmd = new DB2Command(insert, conn, (DB2Transaction)tx))
            {
                cmd.Parameters.Add(new DB2Parameter("@idPersona", DB2Type.Integer) { Value = t.IdPersona });
                cmd.Parameters.Add(new DB2Parameter("@completado", DB2Type.SmallInt) { Value = BoolToSmallInt(t.Completado) });
                cmd.Parameters.Add(new DB2Parameter("@cotitularidad", DB2Type.SmallInt) { Value = BoolToSmallInt(t.Cotitularidad) });
                cmd.Parameters.Add(new DB2Parameter("@titulo", DB2Type.VarGraphic, 100) { Value = t.Titulo });
                cmd.Parameters.Add(new DB2Parameter("@descripcion", DB2Type.VarGraphic, 100) { Value = t.Descripcion });
                cmd.Parameters.Add(new DB2Parameter("@estado", DB2Type.Char, 1) { Value = t.Estado.ToString() });
                
                await cmd.ExecuteNonQueryAsync(ct);
            }

            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn, (DB2Transaction)tx))
            {
                var obj = await idCmd.ExecuteScalarAsync(ct);
                t.Id = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            var fresh = await GetByIdAsync(t.Id, ct);
            if (fresh != null)
            {
                t.FechaCreacion = fresh.FechaCreacion;
                t.UltimoCambio = fresh.UltimoCambio;
            }
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(Tecnologia t, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
  IDPERSONA = @idPersona,
  COMPLETADO = @completado,
  COTITULARIDAD = @cotitularidad,
  TITULO = @titulo,
  DESCRIPCION = @descripcion,
  ESTADO = @estado
WHERE IDOTRITTTECNOLOGIA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idPersona", DB2Type.Integer) { Value = t.IdPersona });
        cmd.Parameters.Add(new DB2Parameter("@completado", DB2Type.SmallInt) { Value = BoolToSmallInt(t.Completado) });
        cmd.Parameters.Add(new DB2Parameter("@cotitularidad", DB2Type.SmallInt) { Value = BoolToSmallInt(t.Cotitularidad) });
        cmd.Parameters.Add(new DB2Parameter("@titulo", DB2Type.VarGraphic, 100) { Value = t.Titulo });
        cmd.Parameters.Add(new DB2Parameter("@descripcion", DB2Type.VarGraphic, 100) { Value = t.Descripcion });
        cmd.Parameters.Add(new DB2Parameter("@estado", DB2Type.Char, 1) { Value = t.Estado.ToString() });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = t.Id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) throw new KeyNotFoundException($"Tecnología {t.Id} no encontrada");
    }

    private Tecnologia MapFromRecord(DB2DataReader rdr)
    {
        return new Tecnologia
        {
            Id = rdr.GetInt32(rdr.GetOrdinal("IDOTRITTTECNOLOGIA")),
            IdPersona = rdr.GetInt32(rdr.GetOrdinal("IDPERSONA")),
            Completado = rdr.GetInt16(rdr.GetOrdinal("COMPLETADO")) != 0,
            Cotitularidad = rdr.GetInt16(rdr.GetOrdinal("COTITULARIDAD")) != 0,
            Titulo = rdr.GetString(rdr.GetOrdinal("TITULO")),
            Descripcion = rdr.GetString(rdr.GetOrdinal("DESCRIPCION")),
            Estado = rdr.GetString(rdr.GetOrdinal("ESTADO"))[0],
            FechaCreacion = rdr.GetDateTime(rdr.GetOrdinal("FECHACREACION")),
            UltimoCambio = rdr.GetDateTime(rdr.GetOrdinal("ULTIMO_CAMBIO"))
        };
    }

    private static short BoolToSmallInt(bool b) => b ? (short)1 : (short)0;
}