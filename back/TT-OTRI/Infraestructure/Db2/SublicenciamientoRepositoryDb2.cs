using System.Data;
using System.Data.Common;
using System.Text;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class SublicenciamientoRepositoryDb2 : ISublicenciamientoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_SUBLICENCIAMIENTO";
    private string FQN => $"{_schema}.{TableName}";

    public SublicenciamientoRepositoryDb2(IConfiguration cfg)
    {
        // Ajusta si en tu entorno usas variables de entorno/secretos.
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* ------------------- READ ------------------- */

    public async Task<IReadOnlyList<SublicenciamientoReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTSUBLICENCIAMIENTO,
  IDOTRITTLICENCIAMIENTO,
  LICENCIASMINIMAS,
  LICENCIASMAXIMAS,
  PORCESPOL,
  PORCRECEPTOR,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTSUBLICENCIAMIENTO DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<SublicenciamientoReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(Map(rdr));
        return list;
    }

    public async Task<SublicenciamientoReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTSUBLICENCIAMIENTO,
  IDOTRITTLICENCIAMIENTO,
  LICENCIASMINIMAS,
  LICENCIASMAXIMAS,
  PORCESPOL,
  PORCRECEPTOR,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTSUBLICENCIAMIENTO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? Map(rdr) : null;
    }

    /* ------------------- WRITE ------------------ */

    public async Task<int> CreateAsync(SublicenciamientoCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDOTRITTLICENCIAMIENTO, LICENCIASMINIMAS, LICENCIASMAXIMAS, PORCESPOL, PORCRECEPTOR, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idLic, @min, @max, @pe, @pr, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idLic", DB2Type.Integer)  { Value = dto.IdLicenciamiento });
                cmd.Parameters.Add(new DB2Parameter("@min",   DB2Type.Integer)  { Value = (object?)dto.LicenciasMinimas ?? DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@max",   DB2Type.Integer)  { Value = (object?)dto.LicenciasMaximas ?? DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@pe",    DB2Type.Decimal)  { Value = (object?)dto.PorcEspol      ?? DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@pr",    DB2Type.Decimal)  { Value = (object?)dto.PorcReceptor   ?? DBNull.Value });

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

    public async Task<bool> PatchAsync(int id, SublicenciamientoPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Construimos dinámicamente el SET
        var set = new StringBuilder();
        var cmd = new DB2Command { Connection = conn };

        void Add(string sqlFrag, string paramName, DB2Type type, object? value)
        {
            if (set.Length > 0) set.Append(", ");
            set.Append(sqlFrag);
            cmd.Parameters.Add(new DB2Parameter(paramName, type) { Value = value ?? DBNull.Value });
        }

        if (dto.IdLicenciamiento.HasValue) Add("IDOTRITTLICENCIAMIENTO = @idLic", "@idLic", DB2Type.Integer, dto.IdLicenciamiento.Value);
        if (dto.LicenciasMinimas.HasValue) Add("LICENCIASMINIMAS      = @min",   "@min",   DB2Type.Integer, dto.LicenciasMinimas.Value);
        if (dto.LicenciasMaximas.HasValue) Add("LICENCIASMAXIMAS      = @max",   "@max",   DB2Type.Integer, dto.LicenciasMaximas.Value);
        if (dto.PorcEspol.HasValue)        Add("PORCESPOL             = @pe",    "@pe",    DB2Type.Decimal, dto.PorcEspol.Value);
        if (dto.PorcReceptor.HasValue)     Add("PORCRECEPTOR          = @pr",    "@pr",    DB2Type.Decimal, dto.PorcReceptor.Value);

        if (set.Length == 0)
            return true; // nada que actualizar -> idempotente

        var sql = $@"
UPDATE {FQN} SET
  {set},
  ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTSUBLICENCIAMIENTO = @id";

        cmd.CommandText = sql;
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* ------------------- MAP -------------------- */

    private static SublicenciamientoReadDto Map(IDataRecord rec)
    {
        int Ord(string n) => rec.GetOrdinal(n);

        int? GetIntN(string n) => rec.IsDBNull(Ord(n)) ? (int?)null : rec.GetInt32(Ord(n));
        decimal? GetDecN(string n)
            => rec.IsDBNull(Ord(n)) ? (decimal?)null : Convert.ToDecimal(rec.GetValue(Ord(n)));

        return new SublicenciamientoReadDto
        {
            IdSublicenciamiento = rec.GetInt32(Ord("IDOTRITTSUBLICENCIAMIENTO")),
            IdLicenciamiento    = rec.GetInt32(Ord("IDOTRITTLICENCIAMIENTO")),
            LicenciasMinimas    = GetIntN("LICENCIASMINIMAS"),
            LicenciasMaximas    = GetIntN("LICENCIASMAXIMAS"),
            PorcEspol           = GetDecN("PORCESPOL"),
            PorcReceptor        = GetDecN("PORCRECEPTOR"),
            FechaCreacion       = Convert.ToDateTime(rec["FECHACREACION"]),
            UltimoCambio        = Convert.ToDateTime(rec["ULTIMO_CAMBIO"])
        };
    }
}
