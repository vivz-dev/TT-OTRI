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
  IDOTRITTCOTITULAR,
  IDOTRITTCOTITULARIDADTECNO,
  IDOTRITTCOTITULARINST,
  IDPERSONA,
  PORCCOTITULARIDAD,
  PERTENECEESPOL,
  NOMBRE,
  CORREO,
  TELEFONO,
  FECHACREACION,
  ULTIMO_CAMBIO
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
  IDOTRITTCOTITULAR,
  IDOTRITTCOTITULARIDADTECNO,
  IDOTRITTCOTITULARINST,
  IDPERSONA,
  PORCCOTITULARIDAD,
  PERTENECEESPOL,
  NOMBRE,
  CORREO,
  TELEFONO,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTCOTITULAR = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> AddAsync(Cotitular c, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var sql = $@"
INSERT INTO {FQN} (
  IDOTRITTCOTITULARIDADTECNO,
  IDOTRITTCOTITULARINST,
  IDPERSONA,
  PORCCOTITULARIDAD,
  PERTENECEESPOL,
  NOMBRE,
  CORREO,
  TELEFONO,
  FECHACREACION,
  ULTIMO_CAMBIO
) VALUES (
  @idTecno,
  @idInst,
  @idPersona,
  @porcentaje,
  @perteneceEspol,
  @nombre,
  @correo,
  @telefono,
  CURRENT TIMESTAMP,
  CURRENT TIMESTAMP
)";
            using var cmd = new DB2Command(sql, conn)
            {
                Transaction = (DB2Transaction)tx
            };
            cmd.Parameters.Add("@idTecno", DB2Type.Integer).Value  = c.IdCotitularidadTecno;
            cmd.Parameters.Add("@idInst", DB2Type.Integer).Value   = c.IdCotitularidadInst;
            cmd.Parameters.Add("@idPersona", DB2Type.Integer).Value= c.IdPersona;
            cmd.Parameters.Add("@porcentaje", DB2Type.Decimal).Value = c.Porcentaje;
            cmd.Parameters.Add("@perteneceEspol", DB2Type.SmallInt).Value = c.PerteneceEspol ? (short)1 : (short)0;

            // Aunque la columna es VARGRAPHIC, el provider acepta VarChar/VarWChar.
            cmd.Parameters.Add("@nombre",   DB2Type.VarGraphic).Value = (object?)c.Nombre   ?? DBNull.Value;
            cmd.Parameters.Add("@correo",   DB2Type.VarGraphic).Value = (object?)c.Correo   ?? DBNull.Value;
            cmd.Parameters.Add("@telefono", DB2Type.VarGraphic).Value = (object?)c.Telefono ?? DBNull.Value;

            await cmd.ExecuteNonQueryAsync(ct);

            using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn)
            {
                Transaction = (DB2Transaction)tx
            };
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

    public async Task UpdateAsync(Cotitular c, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
  IDOTRITTCOTITULARIDADTECNO = @idTecno,
  IDOTRITTCOTITULARINST      = @idInst,
  IDPERSONA                  = @idPersona,
  PORCCOTITULARIDAD          = @porcentaje,
  PERTENECEESPOL             = @perteneceEspol,
  NOMBRE                     = @nombre,
  CORREO                     = @correo,
  TELEFONO                   = @telefono,
  ULTIMO_CAMBIO              = CURRENT TIMESTAMP
WHERE IDOTRITTCOTITULAR = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add("@idTecno", DB2Type.Integer).Value = c.IdCotitularidadTecno;
        cmd.Parameters.Add("@idInst", DB2Type.Integer).Value  = c.IdCotitularidadInst;
        cmd.Parameters.Add("@idPersona", DB2Type.Integer).Value = c.IdPersona;
        cmd.Parameters.Add("@porcentaje", DB2Type.Decimal).Value = c.Porcentaje;
        cmd.Parameters.Add("@perteneceEspol", DB2Type.SmallInt).Value = c.PerteneceEspol ? (short)1 : (short)0;
        cmd.Parameters.Add("@nombre", DB2Type.VarGraphic).Value   = (object?)c.Nombre   ?? DBNull.Value;
        cmd.Parameters.Add("@correo", DB2Type.VarGraphic).Value   = (object?)c.Correo   ?? DBNull.Value;
        cmd.Parameters.Add("@telefono", DB2Type.VarGraphic).Value = (object?)c.Telefono ?? DBNull.Value;
        cmd.Parameters.Add("@id", DB2Type.Integer).Value        = c.Id;

        var affected = await cmd.ExecuteNonQueryAsync(ct);
        if (affected == 0) throw new KeyNotFoundException();
    }

    public async Task<bool> PatchAsync(int id, CotitularPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var updates = new List<string>();
        var ps = new List<DB2Parameter> { new("@id", DB2Type.Integer) { Value = id } };

        if (dto.IdCotitularidadTecno.HasValue) { updates.Add("IDOTRITTCOTITULARIDADTECNO = @idTecno"); ps.Add(new("@idTecno", DB2Type.Integer){ Value = dto.IdCotitularidadTecno.Value }); }
        if (dto.IdCotitularidadInst.HasValue)  { updates.Add("IDOTRITTCOTITULARINST = @idInst");        ps.Add(new("@idInst", DB2Type.Integer){ Value = dto.IdCotitularidadInst.Value }); }
        if (dto.IdPersona.HasValue)            { updates.Add("IDPERSONA = @idPersona");                  ps.Add(new("@idPersona", DB2Type.Integer){ Value = dto.IdPersona.Value }); }
        if (dto.Porcentaje.HasValue)           { updates.Add("PORCCOTITULARIDAD = @porcentaje");         ps.Add(new("@porcentaje", DB2Type.Decimal){ Value = dto.Porcentaje.Value }); }
        if (dto.PerteneceEspol.HasValue)       { updates.Add("PERTENECEESPOL = @perteneceEspol");        ps.Add(new("@perteneceEspol", DB2Type.SmallInt){ Value = dto.PerteneceEspol.Value ? (short)1 : (short)0 }); }
        if (dto.Nombre is not null)            { updates.Add("NOMBRE = @nombre");                        ps.Add(new("@nombre", DB2Type.VarGraphic){ Value = (object?)dto.Nombre ?? DBNull.Value }); }
        if (dto.Correo is not null)            { updates.Add("CORREO = @correo");                        ps.Add(new("@correo", DB2Type.VarGraphic){ Value = (object?)dto.Correo ?? DBNull.Value }); }
        if (dto.Telefono is not null)          { updates.Add("TELEFONO = @telefono");                    ps.Add(new("@telefono", DB2Type.VarGraphic){ Value = (object?)dto.Telefono ?? DBNull.Value }); }

        if (updates.Count == 0) return false;

        var sql = $@"
UPDATE {FQN} SET 
  {string.Join(", ", updates)},
  ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTCOTITULAR = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.AddRange(ps.ToArray());

        var affected = await cmd.ExecuteNonQueryAsync(ct);
        return affected > 0;
    }

    private static Cotitular MapFromRecord(DB2DataReader r)
    {
        string? GetStr(string col) => r.IsDBNull(r.GetOrdinal(col)) ? null : r.GetString(r.GetOrdinal(col));
        bool GetBoolFromSmallInt(string col) => !r.IsDBNull(r.GetOrdinal(col)) && r.GetInt16(r.GetOrdinal(col)) != 0;

        return new Cotitular
        {
            Id                   = r.GetInt32(r.GetOrdinal("IDOTRITTCOTITULAR")),
            IdCotitularidadTecno = r.GetInt32(r.GetOrdinal("IDOTRITTCOTITULARIDADTECNO")),
            IdCotitularidadInst  = r.GetInt32(r.GetOrdinal("IDOTRITTCOTITULARINST")),
            IdPersona            = r.GetInt32(r.GetOrdinal("IDPERSONA")),
            Porcentaje           = r.GetDecimal(r.GetOrdinal("PORCCOTITULARIDAD")),
            PerteneceEspol       = GetBoolFromSmallInt("PERTENECEESPOL"),
            Nombre               = GetStr("NOMBRE"),
            Correo               = GetStr("CORREO"),
            Telefono             = GetStr("TELEFONO"),
            FechaCreacion        = r.GetDateTime(r.GetOrdinal("FECHACREACION")),
            UltimoCambio         = r.GetDateTime(r.GetOrdinal("ULTIMO_CAMBIO"))
        };
    }
}
