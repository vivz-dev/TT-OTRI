// ============================================================================
// Infrastructure/Repositories/RolPersonaRepositoryDb2.cs
// ============================================================================
using System.Data;
using IBM.Data.Db2;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class RolPersonaRepositoryDb2 : IRolPersonaRepository
{
    private readonly string _connString;
    private readonly string _schemaEspol = "ESPOL";
    private string RpFqn  => $"{_schemaEspol}.TBL_ROL_PERSONA";
    private string PerFqn => $"{_schemaEspol}.TBL_PERSONA";
    private string RolFqn => $"{_schemaEspol}.TBL_ROL";

    public RolPersonaRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
    }

    public async Task<IReadOnlyList<(int IdPersona, string Nombres, string Apellidos, int IdRolPersona, short IdRol, string NombreRol)>>
        GetPersonasConRolesOtriAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  p.IDPERSONA                          AS IDPERSONA,
  COALESCE(p.NOMBRES,   '')            AS NOMBRES,
  COALESCE(p.APELLIDOS, '')            AS APELLIDOS,
  rp.IDROLESPERSONA                    AS IDROLPERSONA,
  r.IDROLES                            AS IDROL,
  COALESCE(r.NOMBRE, '')               AS NOMBREROL
FROM {RpFqn} rp
JOIN {PerFqn} p ON p.IDPERSONA = rp.IDPERSONA
JOIN {RolFqn} r ON r.IDROLES   = rp.IDROLES
WHERE r.CODIGOSISTEMA = 'OTRI'
ORDER BY p.APELLIDOS, p.NOMBRES, r.NOMBRE";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<(int, string, string, int, short, string)>();
        while (await rdr.ReadAsync(ct))
        {
            int Ord(string n) => rdr.GetOrdinal(n);

            var idPersona   = rdr.GetInt32 (Ord("IDPERSONA"));
            var nombres     = rdr.IsDBNull(Ord("NOMBRES"))      ? "" : rdr.GetString(Ord("NOMBRES"));
            var apellidos   = rdr.IsDBNull(Ord("APELLIDOS"))    ? "" : rdr.GetString(Ord("APELLIDOS"));
            var idRolPers   = rdr.GetInt32 (Ord("IDROLPERSONA"));
            var idRol       = rdr.GetInt16 (Ord("IDROL"));
            var nombreRol   = rdr.IsDBNull(Ord("NOMBREROL"))    ? "" : rdr.GetString(Ord("NOMBREROL"));

            list.Add((idPersona, nombres, apellidos, idRolPers, idRol, nombreRol));
        }
        return list;
    }

    public async Task<int> CreateAsync(RolPersonaCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {RpFqn}
( IDROLES, IDPERSONA, FECHAINICIO, FECHAFIN, ULTIMO_CAMBIO, VERSION )
VALUES
( @idrol, @idpersona, @inicio, @fin, CURRENT TIMESTAMP, 1 )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idrol",     DB2Type.SmallInt) { Value = dto.IdRol });
                cmd.Parameters.Add(new DB2Parameter("@idpersona", DB2Type.Integer)  { Value = dto.IdPersona });
                cmd.Parameters.Add(new DB2Parameter("@inicio",    DB2Type.Date)
                {
                    Value = dto.FechaInicio.HasValue ? dto.FechaInicio.Value.Date : DBNull.Value
                });
                cmd.Parameters.Add(new DB2Parameter("@fin",       DB2Type.Date)
                {
                    Value = dto.FechaFin.HasValue ? dto.FechaFin.Value.Date : DBNull.Value
                });

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

    public async Task<bool> PatchAsync(int idRolPersona, RolPersonaPatchDto dto, CancellationToken ct = default)
    {
        if (dto is null) return false;

        var sets  = new List<string>();
        var parms = new List<DB2Parameter>();

        if (dto.IdRol.HasValue)
        {
            sets.Add("IDROLES = @idrol");
            parms.Add(new DB2Parameter("@idrol", DB2Type.SmallInt) { Value = dto.IdRol.Value });
        }
        if (dto.FechaInicio.HasValue)
        {
            sets.Add("FECHAINICIO = @inicio");
            parms.Add(new DB2Parameter("@inicio", DB2Type.Date) { Value = dto.FechaInicio.Value.Date });
        }
        if (dto.FechaFin.HasValue)
        {
            sets.Add("FECHAFIN = @fin");
            parms.Add(new DB2Parameter("@fin", DB2Type.Date) { Value = dto.FechaFin.Value.Date });
        }
        if (sets.Count == 0) return true;

        sets.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");

        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {RpFqn}
SET {string.Join(", ", sets)}
WHERE IDROLESPERSONA = @id";

        using var cmd = new DB2Command(sql, conn);
        foreach (var p in parms) cmd.Parameters.Add(p);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = idRolPersona });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int idRolPersona, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"DELETE FROM {RpFqn} WHERE IDROLESPERSONA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = idRolPersona });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }
}
