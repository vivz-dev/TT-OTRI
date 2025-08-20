// Infrastructure/Repositories/RolPermisoRepositoryDb2.cs
using System.Data;
using IBM.Data.Db2;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class RolPermisoRepositoryDb2 : IRolPermisoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_ROL_PERMISO";
    private string FQN => $"{_schema}.{TableName}";

    public RolPermisoRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<RolPermiso>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT IDOTRITTROLPERMISO, IDROLES, IDOTRITTACCION, 
       VISUALIZAR, EDITAR, INHABILITAR, CREAR,
       FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;

        var list = new List<RolPermiso>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<RolPermiso?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT IDOTRITTROLPERMISO, IDROLES, IDOTRITTACCION, 
       VISUALIZAR, EDITAR, INHABILITAR, CREAR,
       FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTROLPERMISO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = await cmd.ExecuteReaderAsync(ct) as DB2DataReader;
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task AddAsync(RolPermiso r, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
(IDROLES, IDOTRITTACCION, VISUALIZAR, EDITAR, INHABILITAR, CREAR, FECHACREACION, ULTIMO_CAMBIO)
VALUES
(@idRol, @idAccion, @visualizar, @editar, @inhabilitar, @crear, CURRENT TIMESTAMP, CURRENT TIMESTAMP)";

            using var cmd = new DB2Command(insert, conn);
            cmd.Transaction = tx as DB2Transaction;
            cmd.Parameters.Add(new DB2Parameter("@idRol", DB2Type.Integer) { Value = r.IdRol });
            cmd.Parameters.Add(new DB2Parameter("@idAccion", DB2Type.Integer) { Value = r.IdAccion });
            cmd.Parameters.Add(new DB2Parameter("@visualizar", DB2Type.Integer) { Value = BoolToInt(r.Visualizar) });
            cmd.Parameters.Add(new DB2Parameter("@editar", DB2Type.Integer) { Value = BoolToInt(r.Editar) });
            cmd.Parameters.Add(new DB2Parameter("@inhabilitar", DB2Type.Integer) { Value = BoolToInt(r.Inhabilitar) });
            cmd.Parameters.Add(new DB2Parameter("@crear", DB2Type.Integer) { Value = BoolToInt(r.Crear) });

            await cmd.ExecuteNonQueryAsync(ct);

            using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
            idCmd.Transaction = tx as DB2Transaction;
            var obj = await idCmd.ExecuteScalarAsync(ct);
            r.Id = Convert.ToInt32(obj);

            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(RolPermiso r, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
IDROLES = @idRol,
IDOTRITTACCION = @idAccion,
VISUALIZAR = @visualizar,
EDITAR = @editar,
INHABILITAR = @inhabilitar,
CREAR = @crear,
ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTROLPERMISO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idRol", DB2Type.Integer) { Value = r.IdRol });
        cmd.Parameters.Add(new DB2Parameter("@idAccion", DB2Type.Integer) { Value = r.IdAccion });
        cmd.Parameters.Add(new DB2Parameter("@visualizar", DB2Type.Integer) { Value = BoolToInt(r.Visualizar) });
        cmd.Parameters.Add(new DB2Parameter("@editar", DB2Type.Integer) { Value = BoolToInt(r.Editar) });
        cmd.Parameters.Add(new DB2Parameter("@inhabilitar", DB2Type.Integer) { Value = BoolToInt(r.Inhabilitar) });
        cmd.Parameters.Add(new DB2Parameter("@crear", DB2Type.Integer) { Value = BoolToInt(r.Crear) });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = r.Id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) throw new KeyNotFoundException($"RolPermiso {r.Id} no existe");
    }

    public async Task<bool> PatchAsync(int id, RolPermisoPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var updates = new List<string>();
        var parameters = new List<DB2Parameter>();

        if (dto.IdRol.HasValue)
        {
            updates.Add("IDROLES = @idRol");
            parameters.Add(new DB2Parameter("@idRol", DB2Type.Integer) { Value = dto.IdRol.Value });
        }
        if (dto.IdAccion.HasValue)
        {
            updates.Add("IDOTRITTACCION = @idAccion");
            parameters.Add(new DB2Parameter("@idAccion", DB2Type.Integer) { Value = dto.IdAccion.Value });
        }
        if (dto.Visualizar.HasValue)
        {
            updates.Add("VISUALIZAR = @visualizar");
            parameters.Add(new DB2Parameter("@visualizar", DB2Type.Integer) { Value = BoolToInt(dto.Visualizar.Value) });
        }
        if (dto.Editar.HasValue)
        {
            updates.Add("EDITAR = @editar");
            parameters.Add(new DB2Parameter("@editar", DB2Type.Integer) { Value = BoolToInt(dto.Editar.Value) });
        }
        if (dto.Inhabilitar.HasValue)
        {
            updates.Add("INHABILITAR = @inhabilitar");
            parameters.Add(new DB2Parameter("@inhabilitar", DB2Type.Integer) { Value = BoolToInt(dto.Inhabilitar.Value) });
        }
        if (dto.Crear.HasValue)
        {
            updates.Add("CREAR = @crear");
            parameters.Add(new DB2Parameter("@crear", DB2Type.Integer) { Value = BoolToInt(dto.Crear.Value) });
        }

        if (updates.Count == 0) return false;

        updates.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");
        
        var sql = $@"
UPDATE {FQN} 
SET {string.Join(", ", updates)}
WHERE IDOTRITTROLPERMISO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.AddRange(parameters.ToArray());
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    private static RolPermiso MapFromRecord(IDataRecord rec)
    {
        return new RolPermiso
        {
            Id = rec.GetInt32(rec.GetOrdinal("IDOTRITTROLPERMISO")),
            IdRol = rec.GetInt32(rec.GetOrdinal("IDROLES")),
            IdAccion = rec.GetInt32(rec.GetOrdinal("IDOTRITTACCION")),
            Visualizar = rec.GetInt32(rec.GetOrdinal("VISUALIZAR")) == 1,
            Editar = rec.GetInt32(rec.GetOrdinal("EDITAR")) == 1,
            Inhabilitar = rec.GetInt32(rec.GetOrdinal("INHABILITAR")) == 1,
            Crear = rec.GetInt32(rec.GetOrdinal("CREAR")) == 1,
            FechaCreacion = rec.GetDateTime(rec.GetOrdinal("FECHACREACION")),
            UltimoCambio = rec.GetDateTime(rec.GetOrdinal("ULTIMO_CAMBIO"))
        };
    }

    private static int BoolToInt(bool b) => b ? 1 : 0;
}