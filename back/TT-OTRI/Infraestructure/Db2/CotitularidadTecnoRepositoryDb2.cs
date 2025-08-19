using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class CotitularidadTecnoRepositoryDb2 : ICotitularidadTecnoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_COTITULARIDAD_TECNO";
    private string FQN => $"{_schema}.{TableName}";

    public CotitularidadTecnoRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<CotitularidadTecno>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTCOTITULARIDADTECNO, IDOTRITTTECNOLOGIA, FECHACREACION, ULTIMO_CAMBIO 
FROM {FQN}";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<CotitularidadTecno>();
        while (await rdr.ReadAsync(ct))
            list.Add(Map(rdr));
        return list;
    }

    public async Task<CotitularidadTecno?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTCOTITULARIDADTECNO, IDOTRITTTECNOLOGIA, FECHACREACION, ULTIMO_CAMBIO 
FROM {FQN}
WHERE IDOTRITTCOTITULARIDADTECNO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? Map(rdr) : null;
    }

    public async Task AddAsync(CotitularidadTecno entity, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var sql = $@"
INSERT INTO {FQN} (IDOTRITTTECNOLOGIA)
VALUES (@idTecnologia)";

            using (var cmd = new DB2Command(sql, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idTecnologia", DB2Type.Integer) { Value = entity.IdTecnologia });
                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener ID generado
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                entity.Id = Convert.ToInt32(obj);
            }

            // Obtener timestamps
            using (var timeCmd = new DB2Command($"SELECT FECHACREACION, ULTIMO_CAMBIO FROM {FQN} WHERE IDOTRITTCOTITULARIDADTECNO = @id", conn))
            {
                timeCmd.Transaction = (DB2Transaction)tx;
                timeCmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = entity.Id });
                using var rdr = (DB2DataReader)await timeCmd.ExecuteReaderAsync(ct);
                if (await rdr.ReadAsync(ct))
                {
                    entity.CreatedAt = rdr.GetDateTime(0);
                    entity.UpdatedAt = rdr.GetDateTime(1);
                }
            }

            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(CotitularidadTecno entity, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} 
SET 
  IDOTRITTTECNOLOGIA = @idTecnologia,
  ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTCOTITULARIDADTECNO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idTecnologia", DB2Type.Integer) { Value = entity.IdTecnologia });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = entity.Id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) throw new KeyNotFoundException($"CotitularidadTecno {entity.Id} no encontrado.");

        // Actualizar timestamp
        var updated = await GetByIdAsync(entity.Id, ct);
        if (updated != null) entity.UpdatedAt = updated.UpdatedAt;
    }

    private static CotitularidadTecno Map(DB2DataReader rdr)
    {
        return new CotitularidadTecno
        {
            Id = rdr.GetInt32(0),
            IdTecnologia = rdr.GetInt32(1),
            CreatedAt = rdr.GetDateTime(2),
            UpdatedAt = rdr.GetDateTime(3)
        };
    }
}