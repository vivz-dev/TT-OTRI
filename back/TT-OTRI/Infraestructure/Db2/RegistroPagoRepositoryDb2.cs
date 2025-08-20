// ============================================================================
// Infrastructure/Repositories/RegistroPagoRepositoryDb2.cs
// ============================================================================
using System.Data;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class RegistroPagoRepositoryDb2 : IRegistroPagoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_REGISTRO_PAGO";
    private string FQN => $"{_schema}.{TableName}";

    public RegistroPagoRepositoryDb2(IConfiguration cfg)
    {
        // Mantengo tu estilo del repo de Resolución (hardcode en ejemplo):
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema     = "SOTRI";
        // Si prefieres por config, cambia por cfg.GetConnectionString("Db2") y SOTRI en appsettings.
    }

    /* ----------------------------- READ ----------------------------- */

    public async Task<IReadOnlyList<RegistroPago>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTREGISTROPAGO,
  IDOTRITTTRANSFERTECNOLOGICA,
  IDPERSONA,
  TOTALPAGO,
  COMPLETADO,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTREGISTROPAGO DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = await cmd.ExecuteReaderAsync(ct);

        var list = new List<RegistroPago>();
        while (await rdr.ReadAsync(ct))
            list.Add(Map(rdr));
        return list;
    }

    public async Task<RegistroPago?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTREGISTROPAGO,
  IDOTRITTTRANSFERTECNOLOGICA,
  IDPERSONA,
  TOTALPAGO,
  COMPLETADO,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTREGISTROPAGO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? Map(rdr) : null;
    }

    /* ----------------------------- WRITE ---------------------------- */

    public async Task<int> CreateAsync(RegistroPago e, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDOTRITTTRANSFERTECNOLOGICA, IDPERSONA, TOTALPAGO, COMPLETADO, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idtt, @idpersona, @total, @comp, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idtt",     DB2Type.Integer)  { Value = e.IdTransferTecnologica });
                cmd.Parameters.Add(new DB2Parameter("@idpersona",DB2Type.Integer)  { Value = e.IdPersona });
                cmd.Parameters.Add(new DB2Parameter("@total",    DB2Type.Decimal)  { Value = e.TotalPago });
                cmd.Parameters.Add(new DB2Parameter("@comp",     DB2Type.SmallInt) { Value = BoolToSmallInt(e.Completado) });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener IDENTITY generado
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                e.IdRegistroPago = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            // Sin transacción: leer timestamps reales
            var back = await GetByIdAsync(e.IdRegistroPago, ct);
            if (back is not null)
            {
                e.CreatedAt = back.CreatedAt;
                e.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
            }

            return e.IdRegistroPago;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> PatchAsync(int id, RegistroPago p, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Construcción dinámica segura (solo columnas presentes)
        var sets = new List<string>();
        var pars = new List<DB2Parameter>();

        void Add(string sql, string name, DB2Type t, object? val)
        {
            sets.Add(sql);
            pars.Add(new DB2Parameter(name, t) { Value = val ?? DBNull.Value });
        }

        // Nota: si el valor es 0 y quieres distinguir "no enviado", usa nullables en tu service.
        if (p.IdTransferTecnologica != default) Add("IDOTRITTTRANSFERTECNOLOGICA = @idtt", "@idtt", DB2Type.Integer, p.IdTransferTecnologica);
        if (p.IdPersona             != default) Add("IDPERSONA                = @idp",  "@idp",  DB2Type.Integer, p.IdPersona);
        if (p.TotalPago             != default) Add("TOTALPAGO                = @tot",  "@tot",  DB2Type.Decimal, p.TotalPago);
        // Para booleano: si viene true o false explícito desde service.
        Add("COMPLETADO = COALESCE(@comp, COMPLETADO)", "@comp", DB2Type.SmallInt,
            p.Completado ? BoolToSmallInt(true) : (object?)null);

        if (sets.Count == 0)
            return true; // nada que actualizar → OK idempotente

        var sql = $@"
UPDATE {FQN}
SET {string.Join(", ", sets)},
    ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTREGISTROPAGO = @id";

        using var cmd = new DB2Command(sql, conn);
        foreach (var par in pars) cmd.Parameters.Add(par);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* ----------------------------- MAP -------------------------------- */

    private static RegistroPago Map(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);
        return new RegistroPago
        {
            IdRegistroPago        = rec.GetInt32 (Ord("IDOTRITTREGISTROPAGO")),
            IdTransferTecnologica = rec.GetInt32 (Ord("IDOTRITTTRANSFERTECNOLOGICA")),
            IdPersona             = rec.GetInt32 (Ord("IDPERSONA")),
            TotalPago             = rec.GetDecimal(Ord("TOTALPAGO")),
            Completado            = Convert.ToInt16(rec.GetValue(Ord("COMPLETADO"))) != 0,
            CreatedAt             = (DateTime)rec.GetValue(Ord("FECHACREACION")),
            UpdatedAt             = (DateTime)rec.GetValue(Ord("ULTIMO_CAMBIO"))
        };
    }

    private static short BoolToSmallInt(bool b) => b ? (short)1 : (short)0;
}
