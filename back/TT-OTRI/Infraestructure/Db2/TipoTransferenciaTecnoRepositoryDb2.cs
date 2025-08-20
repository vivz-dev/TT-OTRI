// Infrastructure/Repositories/TipoTransferenciaTecnoRepositoryDb2.cs
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class TipoTransferenciaTecnoRepositoryDb2 : ITipoTransferenciaTecnoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_TIPOTRANSFERTECNO";
    private string FQN => $"{_schema}.{TableName}";

    public TipoTransferenciaTecnoRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<TipoTransferenciaTecnoReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTTIPOTRANSFERTECNO, IDOTRITTTRANSFERTECNOLOGICA, IDOTRITTTIPOTRANSFERTECNOLOGICA,
  FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTTIPOTRANSFERTECNO DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<TipoTransferenciaTecnoReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<TipoTransferenciaTecnoReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTTIPOTRANSFERTECNO, IDOTRITTTRANSFERTECNOLOGICA, IDOTRITTTIPOTRANSFERTECNOLOGICA,
  FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTTIPOTRANSFERTECNO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> CreateAsync(TipoTransferenciaTecnoCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDOTRITTTRANSFERTECNOLOGICA, IDOTRITTTIPOTRANSFERTECNOLOGICA, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idTransferencia, @idTipoTransferencia, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idTransferencia", DB2Type.Integer) { Value = dto.IdTransferenciaTecnologica });
                cmd.Parameters.Add(new DB2Parameter("@idTipoTransferencia", DB2Type.Integer) { Value = dto.IdTipoTransferenciaTecnologica });
                await cmd.ExecuteNonQueryAsync(ct);
            }

            int newId;
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                newId = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);
            return newId;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> UpdateAsync(int id, TipoTransferenciaTecnoPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var setClauses = new List<string>();
        var parameters = new List<DB2Parameter>();

        if (dto.IdTransferenciaTecnologica.HasValue)
        {
            setClauses.Add("IDOTRITTTRANSFERTECNOLOGICA = @idTransferencia");
            parameters.Add(new DB2Parameter("@idTransferencia", DB2Type.Integer) { Value = dto.IdTransferenciaTecnologica.Value });
        }

        if (dto.IdTipoTransferenciaTecnologica.HasValue)
        {
            setClauses.Add("IDOTRITTTIPOTRANSFERTECNOLOGICA = @idTipoTransferencia");
            parameters.Add(new DB2Parameter("@idTipoTransferencia", DB2Type.Integer) { Value = dto.IdTipoTransferenciaTecnologica.Value });
        }

        if (setClauses.Count == 0)
            return false;

        setClauses.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");

        var sql = $@"
UPDATE {FQN} SET
  {string.Join(", ", setClauses)}
WHERE IDOTRITTTIPOTRANSFERTECNO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });
        cmd.Parameters.AddRange(parameters.ToArray());

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"DELETE FROM {FQN} WHERE IDOTRITTTIPOTRANSFERTECNO = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    private static TipoTransferenciaTecnoReadDto MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new TipoTransferenciaTecnoReadDto
        {
            Id = rec.GetInt32(Ord("IDOTRITTTIPOTRANSFERTECNO")),
            IdTransferenciaTecnologica = rec.GetInt32(Ord("IDOTRITTTRANSFERTECNOLOGICA")),
            IdTipoTransferenciaTecnologica = rec.GetInt32(Ord("IDOTRITTTIPOTRANSFERTECNOLOGICA")),
            FechaCreacion = (DateTime)rec["FECHACREACION"],
            UltimoCambio = (DateTime)rec["ULTIMO_CAMBIO"]
        };
    }
}