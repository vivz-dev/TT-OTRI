using System.Data;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class CotitularRepositoryDb2 : ICotitularRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_COTITULAR";
    private string FQN => $"{_schema}.{TableName}";

    public CotitularRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<Cotitular>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTCOTITULAR, IDOTRITTCOTITULARIDADTECNO, IDOTRITTCOTITULARINST, 
  IDPERSONA, PORCCOTITULARIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;

        var list = new List<Cotitular>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        
        return list;
    }

    public async Task<Cotitular?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
  IDOTRITTCOTITULAR, IDOTRITTCOTITULARIDADTECNO, IDOTRITTCOTITULARINST, 
  IDPERSONA, PORCCOTITULARIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTCOTITULAR = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> AddAsync(Cotitular cotitular, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var sql = $@"
INSERT INTO {FQN} (
  IDOTRITTCOTITULARIDADTECNO, IDOTRITTCOTITULARINST, IDPERSONA, 
  PORCCOTITULARIDAD, FECHACREACION, ULTIMO_CAMBIO
) VALUES (
  @idTecno, @idInst, @idPersona, @porcentaje, 
  CURRENT TIMESTAMP, CURRENT TIMESTAMP
)";

            using var cmd = new DB2Command(sql, conn);
            cmd.Transaction = tx as DB2Transaction;
            cmd.Parameters.Add("@idTecno", DB2Type.Integer).Value = cotitular.IdCotitularidadTecno;
            cmd.Parameters.Add("@idInst", DB2Type.Integer).Value = cotitular.IdCotitularidadInst;
            cmd.Parameters.Add("@idPersona", DB2Type.Integer).Value = cotitular.IdPersona;
            cmd.Parameters.Add("@porcentaje", DB2Type.Decimal).Value = cotitular.Porcentaje;

            await cmd.ExecuteNonQueryAsync(ct);

            // Obtener ID generado
            using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
            idCmd.Transaction = tx as DB2Transaction;
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

    public async Task UpdateAsync(Cotitular cotitular, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
  IDOTRITTCOTITULARIDADTECNO = @idTecno,
  IDOTRITTCOTITULARINST = @idInst,
  IDPERSONA = @idPersona,
  PORCCOTITULARIDAD = @porcentaje,
  ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTCOTITULAR = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add("@idTecno", DB2Type.Integer).Value = cotitular.IdCotitularidadTecno;
        cmd.Parameters.Add("@idInst", DB2Type.Integer).Value = cotitular.IdCotitularidadInst;
        cmd.Parameters.Add("@idPersona", DB2Type.Integer).Value = cotitular.IdPersona;
        cmd.Parameters.Add("@porcentaje", DB2Type.Decimal).Value = cotitular.Porcentaje;
        cmd.Parameters.Add("@id", DB2Type.Integer).Value = cotitular.Id;

        var affected = await cmd.ExecuteNonQueryAsync(ct);
        if (affected == 0) throw new KeyNotFoundException();
    }

    public async Task<bool> PatchAsync(int id, CotitularPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var updates = new List<string>();
        var parameters = new List<DB2Parameter> { new DB2Parameter("@id", DB2Type.Integer) { Value = id } };

        if (dto.IdCotitularidadTecno.HasValue)
        {
            updates.Add("IDOTRITTCOTITULARIDADTECNO = @idTecno");
            parameters.Add(new DB2Parameter("@idTecno", DB2Type.Integer) { Value = dto.IdCotitularidadTecno.Value });
        }
        
        if (dto.IdCotitularidadInst.HasValue)
        {
            updates.Add("IDOTRITTCOTITULARINST = @idInst");
            parameters.Add(new DB2Parameter("@idInst", DB2Type.Integer) { Value = dto.IdCotitularidadInst.Value });
        }
        
        if (dto.IdPersona.HasValue)
        {
            updates.Add("IDPERSONA = @idPersona");
            parameters.Add(new DB2Parameter("@idPersona", DB2Type.Integer) { Value = dto.IdPersona.Value });
        }
        
        if (dto.Porcentaje.HasValue)
        {
            updates.Add("PORCCOTITULARIDAD = @porcentaje");
            parameters.Add(new DB2Parameter("@porcentaje", DB2Type.Decimal) { Value = dto.Porcentaje.Value });
        }

        if (updates.Count == 0) return false;

        var sql = $@"
UPDATE {FQN} SET 
  {string.Join(", ", updates)},
  ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTCOTITULAR = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.AddRange(parameters.ToArray());
        
        var affected = await cmd.ExecuteNonQueryAsync(ct);
        return affected > 0;
    }

    private static Cotitular MapFromRecord(DB2DataReader rdr)
    {
        return new Cotitular
        {
            Id = rdr.GetInt32(rdr.GetOrdinal("IDOTRITTCOTITULAR")),
            IdCotitularidadTecno = rdr.GetInt32(rdr.GetOrdinal("IDOTRITTCOTITULARIDADTECNO")),
            IdCotitularidadInst = rdr.GetInt32(rdr.GetOrdinal("IDOTRITTCOTITULARINST")),
            IdPersona = rdr.GetInt32(rdr.GetOrdinal("IDPERSONA")),
            Porcentaje = rdr.GetDecimal(rdr.GetOrdinal("PORCCOTITULARIDAD")),
            FechaCreacion = rdr.GetDateTime(rdr.GetOrdinal("FECHACREACION")),
            UltimoCambio = rdr.GetDateTime(rdr.GetOrdinal("ULTIMO_CAMBIO"))
        };
    }
}