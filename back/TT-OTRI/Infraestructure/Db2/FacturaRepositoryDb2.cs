// ============================================================================
// Infrastructure/Db2/FacturaRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class FacturaRepositoryDb2 : IFacturaRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_FACTURA";
    private string FQN => $"{_schema}.{TableName}";

    public FacturaRepositoryDb2(IConfiguration cfg)
    {
        // Ajusta a tu configuración real; usé el mismo estilo que tus repos existentes:
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema     = "SOTRI";
    }

    /* --------------------------- READ ---------------------------------- */

    public async Task<IReadOnlyList<Factura>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTFACTURA, IDOTRITTREGISTROPAGO, MONTO, FECHAFACTURA,
  FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTFACTURA DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = await cmd.ExecuteReaderAsync(ct); // DbDataReader OK
        var list = new List<Factura>();
        while (await rdr.ReadAsync(ct))
            list.Add(Map(rdr)); // Map(IDataRecord) → evita el error de tipos
        return list;
    }

    public async Task<Factura?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTFACTURA, IDOTRITTREGISTROPAGO, MONTO, FECHAFACTURA,
  FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTFACTURA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? Map(rdr) : null;
    }

    /* --------------------------- CREATE -------------------------------- */

    public async Task<int> CreateAsync(Factura f, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDOTRITTREGISTROPAGO, MONTO, FECHAFACTURA, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idreg, @monto, @ffac, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                // FK
                cmd.Parameters.Add(new DB2Parameter("@idreg", DB2Type.Integer) { Value = f.IdRegistroPago });
                // DECIMAL(12,2)
                var pMonto = new DB2Parameter("@monto", DB2Type.Decimal) { Value = f.Monto };
                pMonto.Precision = 12;
                pMonto.Scale     = 2;
                cmd.Parameters.Add(pMonto);
                // DATE
                cmd.Parameters.Add(new DB2Parameter("@ffac", DB2Type.Date) { Value = f.FechaFactura.Date });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Recuperar IDENTITY local
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                f.IdFactura = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            // Sincronizar timestamps reales
            var back = await GetByIdAsync(f.IdFactura, ct);
            if (back != null)
            {
                f.CreatedAt = back.CreatedAt;
                f.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                f.CreatedAt = f.UpdatedAt = DateTime.UtcNow;
            }

            return f.IdFactura;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    /* --------------------------- PATCH --------------------------------- */

    public async Task<bool> PatchAsync(int id, FacturaPatchDto patch, CancellationToken ct = default)
    {
        // Construcción dinámica del SET
        var sets = new List<string>();
        var pars = new List<DB2Parameter>();

        if (patch.IdRegistroPago.HasValue)
        {
            sets.Add("IDOTRITTREGISTROPAGO = @idreg");
            pars.Add(new DB2Parameter("@idreg", DB2Type.Integer) { Value = patch.IdRegistroPago.Value });
        }
        if (patch.Monto.HasValue)
        {
            sets.Add("MONTO = @monto");
            var p = new DB2Parameter("@monto", DB2Type.Decimal) { Value = patch.Monto.Value };
            p.Precision = 12; p.Scale = 2;
            pars.Add(p);
        }
        if (patch.FechaFactura.HasValue)
        {
            sets.Add("FECHAFACTURA = @ffac");
            pars.Add(new DB2Parameter("@ffac", DB2Type.Date) { Value = patch.FechaFactura.Value.Date });
        }

        if (sets.Count == 0) return true; // Nada que actualizar → OK idempotente

        var sql = $@"
UPDATE {FQN}
   SET {string.Join(", ", sets)},
       ULTIMO_CAMBIO = CURRENT TIMESTAMP
 WHERE IDOTRITTFACTURA = @id";

        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        using var cmd = new DB2Command(sql, conn);
        foreach (var p in pars) cmd.Parameters.Add(p);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* ------------------------- MAPEO SEGURO ----------------------------- */

    private static Factura Map(IDataRecord r)
    {
        int Ord(string n) => r.GetOrdinal(n);

        return new Factura
        {
            IdFactura      = r.GetInt32(Ord("IDOTRITTFACTURA")),
            IdRegistroPago = r.GetInt32(Ord("IDOTRITTREGISTROPAGO")),
            Monto          = Convert.ToDecimal(r.GetValue(Ord("MONTO"))),
            FechaFactura   = (DateTime)r["FECHAFACTURA"],   // NOT NULL (DATE)
            CreatedAt      = (DateTime)r["FECHACREACION"],  // NOT NULL (TS)
            UpdatedAt      = (DateTime)r["ULTIMO_CAMBIO"]   // NOT NULL (TS)
        };
    }
}
