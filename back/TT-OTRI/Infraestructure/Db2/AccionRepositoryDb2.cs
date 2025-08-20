// ============================================================================
// Infrastructure/Repositories/AccionRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class AccionRepositoryDb2 : IAccionRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_ACCION";
    private string FQN => $"{_schema}.{TableName}";

    public AccionRepositoryDb2(IConfiguration cfg)
    {
        // Ajusta según tu configuración real:
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IReadOnlyList<Accion>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT IDOTRITTACCION, NOMBRE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTACCION DESC";

        using var cmd = new DB2Command(sql, conn);
        await using DbDataReader rd = await cmd.ExecuteReaderAsync(ct);

        var list = new List<Accion>();
        while (await rd.ReadAsync(ct))
            list.Add(Map(rd));
        return list;
    }

    public async Task<Accion?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT IDOTRITTACCION, NOMBRE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTACCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using DbDataReader rd = await cmd.ExecuteReaderAsync(ct);
        return await rd.ReadAsync(ct) ? Map(rd) : null;
    }

    public async Task<int> CreateAsync(Accion a, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN} (NOMBRE, FECHACREACION, ULTIMO_CAMBIO)
VALUES (@nombre, CURRENT TIMESTAMP, CURRENT TIMESTAMP)";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;

                // La columna es VARGRAPHIC(100): usa VarGraphic para preservar UTF-16
                cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarGraphic) { Value = a.Nombre });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener el IDENTITY generado
            int newId;
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                newId = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            // Leer timestamps reales
            var back = await GetByIdAsync(newId, ct);
            if (back is not null)
            {
                a.IdAccion  = back.IdAccion;
                a.CreatedAt = back.CreatedAt;
                a.UpdatedAt = back.UpdatedAt;
                a.Nombre    = back.Nombre;
            }
            else
            {
                a.IdAccion = newId;
                a.CreatedAt = a.UpdatedAt = DateTime.UtcNow;
            }

            return newId;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> PatchAsync(int id, string? nombre, CancellationToken ct = default)
    {
        if (nombre is null)
        {
            // Nada que actualizar (idempotente)
            // También podrías retornar false si prefieres.
            return await TouchAsync(id, ct);
        }

        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN}
   SET NOMBRE = @nombre,
       ULTIMO_CAMBIO = CURRENT TIMESTAMP
 WHERE IDOTRITTACCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarGraphic) { Value = nombre });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    private async Task<bool> TouchAsync(int id, CancellationToken ct)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN}
   SET ULTIMO_CAMBIO = CURRENT TIMESTAMP
 WHERE IDOTRITTACCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* --------------------------- Helpers --------------------------- */

    private static Accion Map(IDataRecord rec)
    {
        int Ord(string n) => rec.GetOrdinal(n);

        return new Accion
        {
            IdAccion  = rec.GetInt32(Ord("IDOTRITTACCION")),
            // NOMBRE es VARGRAPHIC: DB2 provider lo entrega como string .NET
            Nombre    = rec["NOMBRE"] as string ?? string.Empty,
            CreatedAt = (DateTime)rec["FECHACREACION"],
            UpdatedAt = (DateTime)rec["ULTIMO_CAMBIO"]
        };
    }
}
