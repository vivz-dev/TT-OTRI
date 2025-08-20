// ============================================================================
// Infrastructure/Repositories/CesionRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class CesionRepositoryDb2 : ICesionRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_CESION";
    private string FQN => $"{_schema}.{TableName}";

    public CesionRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* ----------------------------- LECTURA ----------------------------- */

    public async Task<IReadOnlyList<CesionReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
    IDOTRITTCESION, IDOTRITTTRANSFERTECNOLOGICA, FECHALIMITE,
    FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTCESION DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;

        var list = new List<CesionReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<CesionReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
    IDOTRITTCESION, IDOTRITTTRANSFERTECNOLOGICA, FECHALIMITE,
    FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTCESION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    /* ----------------------------- ESCRITURA --------------------------- */

    public async Task<int> CreateAsync(CesionCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
(IDOTRITTTRANSFERTECNOLOGICA, FECHALIMITE, FECHACREACION, ULTIMO_CAMBIO)
VALUES
(@idTransfer, @fechaLimite, CURRENT TIMESTAMP, CURRENT TIMESTAMP)";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idTransfer", DB2Type.Integer) 
                    { Value = dto.IdOtriTtTransferTecnologica });
                cmd.Parameters.Add(new DB2Parameter("@fechaLimite", DB2Type.Date) 
                    { Value = dto.FechaLimite?.Date ?? (object)DBNull.Value });
                
                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener ID autogenerado
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

    public async Task<bool> PatchAsync(int id, CesionPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var setParts = new List<string>();
        var parameters = new List<DB2Parameter>();

        if (dto.IdOtriTtTransferTecnologica.HasValue)
        {
            setParts.Add("IDOTRITTTRANSFERTECNOLOGICA = @idTransfer");
            parameters.Add(new DB2Parameter("@idTransfer", DB2Type.Integer) 
                { Value = dto.IdOtriTtTransferTecnologica.Value });
        }

        if (dto.FechaLimite != null)
        {
            setParts.Add("FECHALIMITE = @fechaLimite");
            parameters.Add(new DB2Parameter("@fechaLimite", DB2Type.Date) 
                { Value = dto.FechaLimite.Value.Date });
        }

        if (!setParts.Any())
            return false; // Nada que actualizar

        setParts.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");

        var sql = $@"
UPDATE {FQN} SET {string.Join(", ", setParts)}
WHERE IDOTRITTCESION = @id";

        using var cmd = new DB2Command(sql, conn);
        parameters.ForEach(p => cmd.Parameters.Add(p));
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* --------------------------- HELPERS -------------------------------- */

    private static CesionReadDto MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new CesionReadDto
        {
            IdOtriTtCesion = rec.GetInt32(Ord("IDOTRITTCESION")),
            IdOtriTtTransferTecnologica = rec.GetInt32(Ord("IDOTRITTTRANSFERTECNOLOGICA")),
            FechaLimite = rec.IsDBNull(Ord("FECHALIMITE")) ? null : rec.GetDateTime(Ord("FECHALIMITE")),
            FechaCreacion = rec.IsDBNull(Ord("FECHACREACION")) ? null : rec.GetDateTime(Ord("FECHACREACION")),
            UltimoCambio = rec.IsDBNull(Ord("ULTIMO_CAMBIO")) ? null : rec.GetDateTime(Ord("ULTIMO_CAMBIO"))
        };
    }
}