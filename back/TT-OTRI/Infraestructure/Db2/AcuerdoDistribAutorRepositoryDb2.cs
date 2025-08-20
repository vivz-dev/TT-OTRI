using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class AcuerdoDistribAutorRepositoryDb2 : IAcuerdoDistribAutorRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_ACUERDODISTRIB_AUTORES";
    private string FQN => $"{_schema}.{TableName}";

    public AcuerdoDistribAutorRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<AcuerdoDistribAutorReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTACUERDODISTRIBAUTORES, 
  IDOTRITTTECNOLOGIA, 
  FECHACREACION, 
  ULTIMO_CAMBIO 
FROM {FQN}";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<AcuerdoDistribAutorReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<AcuerdoDistribAutorReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTACUERDODISTRIBAUTORES, 
  IDOTRITTTECNOLOGIA, 
  FECHACREACION, 
  ULTIMO_CAMBIO 
FROM {FQN}
WHERE IDOTRITTACUERDODISTRIBAUTORES = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> AddAsync(AcuerdoDistribAutorCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var sql = $@"
INSERT INTO {FQN} (IDOTRITTTECNOLOGIA)
VALUES (@idTecnologia)";

            using var cmd = new DB2Command(sql, conn);
            cmd.Transaction = (DB2Transaction)tx;
            cmd.Parameters.Add(new DB2Parameter("@idTecnologia", DB2Type.Integer) { Value = dto.IdTecnologia });

            await cmd.ExecuteNonQueryAsync(ct);

            // Obtener el ID generado
            using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
            idCmd.Transaction = (DB2Transaction)tx;
            var newId = Convert.ToInt32(await idCmd.ExecuteScalarAsync(ct));

            await tx.CommitAsync(ct);
            return newId;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> PatchAsync(int id, AcuerdoDistribAutorPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Construir la consulta dinámicamente
        var updates = new List<string>();
        var parameters = new List<DB2Parameter>();

        if (dto.IdTecnologia.HasValue)
        {
            updates.Add("IDOTRITTTECNOLOGIA = @idTecnologia");
            parameters.Add(new DB2Parameter("@idTecnologia", DB2Type.Integer) { Value = dto.IdTecnologia.Value });
        }

        if (updates.Count == 0)
            return false; // No hay campos para actualizar

        var setClause = string.Join(", ", updates);
        var sql = $@"
UPDATE {FQN} 
SET {setClause}, ULTIMO_CAMBIO = CURRENT TIMESTAMP 
WHERE IDOTRITTACUERDODISTRIBAUTORES = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });
        cmd.Parameters.AddRange(parameters.ToArray());

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    private static AcuerdoDistribAutorReadDto MapFromRecord(IDataRecord rec)
    {
        return new AcuerdoDistribAutorReadDto
        {
            Id = rec.GetInt32(rec.GetOrdinal("IDOTRITTACUERDODISTRIBAUTORES")),
            IdTecnologia = rec.GetInt32(rec.GetOrdinal("IDOTRITTTECNOLOGIA")),
            FechaCreacion = rec.GetDateTime(rec.GetOrdinal("FECHACREACION")),
            UltimoCambio = rec.GetDateTime(rec.GetOrdinal("ULTIMO_CAMBIO"))
        };
    }
}