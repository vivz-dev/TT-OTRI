// ============================================================================
// Infrastructure/Repositories/LicenciamientoRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class LicenciamientoRepositoryDb2 : ILicenciamientoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_LICENCIAMIENTO";
    private string FQN => $"{_schema}.{TableName}";

    public LicenciamientoRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* ----------------------------- LECTURA ----------------------------- */

    public async Task<IEnumerable<Licenciamiento>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTLICENCIAMIENTO, IDOTRITTTRANSFERTECNOLOGICA, SUBLICENCIAMIENTO,
  FECHALIMITE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTLICENCIAMIENTO DESC";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<Licenciamiento>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<Licenciamiento?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTLICENCIAMIENTO, IDOTRITTTRANSFERTECNOLOGICA, SUBLICENCIAMIENTO,
  FECHALIMITE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTLICENCIAMIENTO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    /* ----------------------------- ESCRITURA --------------------------- */

    public async Task AddAsync(Licenciamiento licenciamiento, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        using var tx = (DB2Transaction)await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDOTRITTTRANSFERTECNOLOGICA, SUBLICENCIAMIENTO, FECHALIMITE, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idTransfer, @subLicenciamiento, @fechaLimite, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = tx;
                cmd.Parameters.Add(new DB2Parameter("@idTransfer", DB2Type.Integer) 
                { 
                    Value = licenciamiento.IdTransferTecnologica 
                });
                cmd.Parameters.Add(new DB2Parameter("@subLicenciamiento", DB2Type.SmallInt) 
                { 
                    Value = BoolToSmallInt(licenciamiento.SubLicenciamiento) 
                });
                cmd.Parameters.Add(new DB2Parameter("@fechaLimite", DB2Type.Date)
                {
                    Value = licenciamiento.FechaLimite?.Date ?? (object)DBNull.Value
                });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener ID autogenerado
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                licenciamiento.Id = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            // Leer los timestamps reales tras commit
            var back = await GetByIdAsync(licenciamiento.Id, ct);
            if (back != null)
            {
                licenciamiento.CreatedAt = back.CreatedAt;
                licenciamiento.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                licenciamiento.CreatedAt = licenciamiento.UpdatedAt = DateTime.UtcNow;
            }
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(Licenciamiento licenciamiento, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
  IDOTRITTTRANSFERTECNOLOGICA = @idTransfer,
  SUBLICENCIAMIENTO = @subLicenciamiento,
  FECHALIMITE = @fechaLimite,
  ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTLICENCIAMIENTO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idTransfer", DB2Type.Integer) 
        { 
            Value = licenciamiento.IdTransferTecnologica 
        });
        cmd.Parameters.Add(new DB2Parameter("@subLicenciamiento", DB2Type.SmallInt) 
        { 
            Value = BoolToSmallInt(licenciamiento.SubLicenciamiento) 
        });
        cmd.Parameters.Add(new DB2Parameter("@fechaLimite", DB2Type.Date)
        {
            Value = licenciamiento.FechaLimite?.Date ?? (object)DBNull.Value
        });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) 
        { 
            Value = licenciamiento.Id 
        });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) 
            throw new KeyNotFoundException($"Licenciamiento {licenciamiento.Id} no existe.");

        // Sincronizar UpdatedAt real
        var back = await GetByIdAsync(licenciamiento.Id, ct);
        if (back != null) 
            licenciamiento.UpdatedAt = back.UpdatedAt;
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $"DELETE FROM {FQN} WHERE IDOTRITTLICENCIAMIENTO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0)
            throw new KeyNotFoundException($"Licenciamiento {id} no existe.");
    }

    /* --------------------------- HELPERS -------------------------------- */

    private static Licenciamiento MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new Licenciamiento
        {
            Id = rec.GetInt32(Ord("IDOTRITTLICENCIAMIENTO")),
            IdTransferTecnologica = rec.GetInt32(Ord("IDOTRITTTRANSFERTECNOLOGICA")),
            SubLicenciamiento = Convert.ToInt16(rec.GetValue(Ord("SUBLICENCIAMIENTO"))) != 0,
            FechaLimite = rec.IsDBNull(Ord("FECHALIMITE")) ? null : rec.GetDateTime(Ord("FECHALIMITE")),
            CreatedAt = rec.GetDateTime(Ord("FECHACREACION")),
            UpdatedAt = rec.GetDateTime(Ord("ULTIMO_CAMBIO"))
        };
    }

    private static short BoolToSmallInt(bool b) => b ? (short)1 : (short)0;
}