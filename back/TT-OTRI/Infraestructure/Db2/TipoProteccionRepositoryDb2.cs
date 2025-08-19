using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class TipoProteccionRepositoryDb2 : ITipoProteccionRepository
{
    private readonly string _connString;
    private const string Schema = "SOTRI";
    private const string TableName = "T_OTRI_TT_TIPO_PROTECCION";
    private string FQN => $"{Schema}.{TableName}";

    public TipoProteccionRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
    }

    public async Task<IEnumerable<TipoProteccion>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $"SELECT IDOTRITTTIPOPROTECCION, NOMBRE, FECHACREACION, ULTIMO_CAMBIO FROM {FQN}";
        using var cmd = new DB2Command(sql, conn);
        using var rdr = await cmd.ExecuteReaderAsync(ct) as DbDataReader;

        var list = new List<TipoProteccion>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<TipoProteccion?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $"SELECT IDOTRITTTIPOPROTECCION, NOMBRE, FECHACREACION, ULTIMO_CAMBIO FROM {FQN} WHERE IDOTRITTTIPOPROTECCION = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = await cmd.ExecuteReaderAsync(ct) as DbDataReader;
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> CreateAsync(TipoProteccion tipo, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var sql = $@"
INSERT INTO {FQN} (NOMBRE, FECHACREACION, ULTIMO_CAMBIO)
VALUES (@nombre, CURRENT TIMESTAMP, CURRENT TIMESTAMP)";

            using (var cmd = new DB2Command(sql, conn))
            {
                cmd.Transaction = tx as DB2Transaction;
                cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarChar) { Value = tipo.Nombre });
                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener el ID generado
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = tx as DB2Transaction;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                tipo.Id = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);
            return tipo.Id;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(TipoProteccion tipo, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} 
SET NOMBRE = @nombre, ULTIMO_CAMBIO = CURRENT TIMESTAMP 
WHERE IDOTRITTTIPOPROTECCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarChar) { Value = tipo.Nombre });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = tipo.Id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) throw new KeyNotFoundException($"TipoProteccion {tipo.Id} no encontrado.");
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $"DELETE FROM {FQN} WHERE IDOTRITTTIPOPROTECCION = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    private static TipoProteccion MapFromRecord(IDataRecord rec)
    {
        return new TipoProteccion
        {
            Id = rec.GetInt32(rec.GetOrdinal("IDOTRITTTIPOPROTECCION")),
            Nombre = rec["NOMBRE"] as string ?? string.Empty,
            CreatedAt = (DateTime)rec["FECHACREACION"],
            UpdatedAt = (DateTime)rec["ULTIMO_CAMBIO"]
        };
    }
}