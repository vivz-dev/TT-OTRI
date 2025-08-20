using System.Data;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using Microsoft.Extensions.Logging;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class RegaliaRepositoryDb2 : IRegaliaRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private readonly ILogger<RegaliaRepositoryDb2> _logger;
    private const string TableName = "T_OTRI_TT_REGALIAS";
    private string FQN => $"{_schema}.{TableName}";

    public RegaliaRepositoryDb2(IConfiguration cfg, ILogger<RegaliaRepositoryDb2> logger)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
        _logger = logger;
    }

    public async Task<IEnumerable<Regalia>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            var sql = $@"
SELECT IDOTRITTREGALIAS, IDOTRITTTRANSFERTECNOLOGICA, CANTIDADUNIDAD, 
       CANTIDADPORCENTAJE, ESPORUNIDAD, ESPORCENTAJE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}";

            using var cmd = new DB2Command(sql, conn);
            using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;

            var list = new List<Regalia>();
            while (await rdr.ReadAsync(ct))
                list.Add(MapFromRecord(rdr));
            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all regalias");
            throw;
        }
    }

    public async Task<Regalia?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        try
        {
            using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            var sql = $@"
SELECT IDOTRITTREGALIAS, IDOTRITTTRANSFERTECNOLOGICA, CANTIDADUNIDAD, 
       CANTIDADPORCENTAJE, ESPORUNIDAD, ESPORCENTAJE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN} WHERE IDOTRITTREGALIAS = @id";

            using var cmd = new DB2Command(sql, conn);
            cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

            using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;
            return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting regalia by id {Id}", id);
            throw;
        }
    }

    public async Task AddAsync(Regalia regalia, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN} 
(IDOTRITTTRANSFERTECNOLOGICA, CANTIDADUNIDAD, CANTIDADPORCENTAJE, 
 ESPORUNIDAD, ESPORCENTAJE, FECHACREACION, ULTIMO_CAMBIO)
VALUES 
(@idTT, @cantUnidad, @cantPorc, @esUnidad, @esPorc, CURRENT TIMESTAMP, CURRENT TIMESTAMP)";

            using var cmd = new DB2Command(insert, conn);
            cmd.Transaction = tx as DB2Transaction;
            cmd.Parameters.Add(new DB2Parameter("@idTT", DB2Type.Integer) { Value = regalia.IdTransferenciaTecnologica });
            cmd.Parameters.Add(new DB2Parameter("@cantUnidad", DB2Type.Integer) { Value = (object)regalia.CantidadUnidad ?? DBNull.Value });
            cmd.Parameters.Add(new DB2Parameter("@cantPorc", DB2Type.Decimal) { Value = (object)regalia.CantidadPorcentaje ?? DBNull.Value, Scale = 2 });
            cmd.Parameters.Add(new DB2Parameter("@esUnidad", DB2Type.SmallInt) { Value = BoolToSmallInt(regalia.EsPorUnidad) });
            cmd.Parameters.Add(new DB2Parameter("@esPorc", DB2Type.SmallInt) { Value = BoolToSmallInt(regalia.EsPorcentaje) });

            await cmd.ExecuteNonQueryAsync(ct);

            using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
            idCmd.Transaction = tx as DB2Transaction;
            var obj = await idCmd.ExecuteScalarAsync(ct);
            regalia.Id = Convert.ToInt32(obj);

            await tx.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            _logger.LogError(ex, "Error adding regalia");
            throw;
        }
    }

    public async Task UpdateAsync(Regalia regalia, CancellationToken ct = default)
    {
        try
        {
            using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            var sql = $@"
UPDATE {FQN} SET 
IDOTRITTTRANSFERTECNOLOGICA = @idTT,
CANTIDADUNIDAD = @cantUnidad,
CANTIDADPORCENTAJE = @cantPorc,
ESPORUNIDAD = @esUnidad,
ESPORCENTAJE = @esPorc,
ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTREGALIAS = @id";

            using var cmd = new DB2Command(sql, conn);
            cmd.Parameters.Add(new DB2Parameter("@idTT", DB2Type.Integer) { Value = regalia.IdTransferenciaTecnologica });
            cmd.Parameters.Add(new DB2Parameter("@cantUnidad", DB2Type.Integer) { Value = (object)regalia.CantidadUnidad ?? DBNull.Value });
            cmd.Parameters.Add(new DB2Parameter("@cantPorc", DB2Type.Decimal) { Value = (object)regalia.CantidadPorcentaje ?? DBNull.Value, Scale = 2 });
            cmd.Parameters.Add(new DB2Parameter("@esUnidad", DB2Type.SmallInt) { Value = BoolToSmallInt(regalia.EsPorUnidad) });
            cmd.Parameters.Add(new DB2Parameter("@esPorc", DB2Type.SmallInt) { Value = BoolToSmallInt(regalia.EsPorcentaje) });
            cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = regalia.Id });

            await cmd.ExecuteNonQueryAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating regalia {Id}", regalia.Id);
            throw;
        }
    }

    public async Task<bool> PatchAsync(int id, RegaliaPatchDto dto, CancellationToken ct = default)
    {
        try
        {
            using var conn = new DB2Connection(_connString);
            await conn.OpenAsync(ct);

            var updates = new List<string>();
            var parameters = new List<DB2Parameter>();

            if (dto.CantidadUnidad.HasValue)
            {
                updates.Add("CANTIDADUNIDAD = @cantUnidad");
                parameters.Add(new DB2Parameter("@cantUnidad", DB2Type.Integer) { Value = dto.CantidadUnidad.Value });
            }
            if (dto.CantidadPorcentaje.HasValue)
            {
                updates.Add("CANTIDADPORCENTAJE = @cantPorc");
                parameters.Add(new DB2Parameter("@cantPorc", DB2Type.Decimal) { Value = dto.CantidadPorcentaje.Value, Scale = 2 });
            }
            if (dto.EsPorUnidad.HasValue)
            {
                updates.Add("ESPORUNIDAD = @esUnidad");
                parameters.Add(new DB2Parameter("@esUnidad", DB2Type.SmallInt) { Value = BoolToSmallInt(dto.EsPorUnidad.Value) });
            }
            if (dto.EsPorcentaje.HasValue)
            {
                updates.Add("ESPORCENTAJE = @esPorc");
                parameters.Add(new DB2Parameter("@esPorc", DB2Type.SmallInt) { Value = BoolToSmallInt(dto.EsPorcentaje.Value) });
            }

            if (!updates.Any()) return false;

            updates.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");
            var sql = $"UPDATE {FQN} SET {string.Join(", ", updates)} WHERE IDOTRITTREGALIAS = @id";
            parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

            using var cmd = new DB2Command(sql, conn);
            cmd.Parameters.AddRange(parameters.ToArray());
            var affectedRows = await cmd.ExecuteNonQueryAsync(ct);
            return affectedRows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error patching regalia {Id}", id);
            throw;
        }
    }

    private static Regalia MapFromRecord(IDataRecord rec)
    {
        return new Regalia
        {
            Id = rec.GetInt32(rec.GetOrdinal("IDOTRITTREGALIAS")),
            IdTransferenciaTecnologica = rec.GetInt32(rec.GetOrdinal("IDOTRITTTRANSFERTECNOLOGICA")),
            CantidadUnidad = rec["CANTIDADUNIDAD"] as int?,
            CantidadPorcentaje = rec["CANTIDADPORCENTAJE"] as decimal?,
            EsPorUnidad = Convert.ToBoolean(rec["ESPORUNIDAD"]),
            EsPorcentaje = Convert.ToBoolean(rec["ESPORCENTAJE"]),
            FechaCreacion = (DateTime)rec["FECHACREACION"],
            UltimoCambio = (DateTime)rec["ULTIMO_CAMBIO"]
        };
    }

    private static short BoolToSmallInt(bool b) => b ? (short)1 : (short)0;
}