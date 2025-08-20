// ============================================================================
// Infrastructure/Repositories/TransferTecnologicaRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class TransferTecnologicaRepositoryDb2 : ITransferTecnologicaRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_TRANSFER_TECNOLOGICA";
    private string FQN => $"{_schema}.{TableName}";

    public TransferTecnologicaRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* --------------------------- READ --------------------------- */

    public async Task<IReadOnlyList<TransferTecnologica>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTTRANSFERTECNOLOGICA, IDPERSONA, IDOTRITTRESOLUCION, IDOTRITTTECNOLOGIA,
  MONTO, PAGO, COMPLETADO, TITULO, DESCRIPCION, ESTADO,
  FECHAINICIO, FECHAFIN, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTTRANSFERTECNOLOGICA DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<TransferTecnologica>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<TransferTecnologica?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTTRANSFERTECNOLOGICA, IDPERSONA, IDOTRITTRESOLUCION, IDOTRITTTECNOLOGIA,
  MONTO, PAGO, COMPLETADO, TITULO, DESCRIPCION, ESTADO,
  FECHAINICIO, FECHAFIN, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTTRANSFERTECNOLOGICA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rd = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rd.ReadAsync(ct) ? MapFromRecord(rd) : null;
    }

    /* --------------------------- CREATE ------------------------- */

    public async Task<int> CreateAsync(TransferTecnologica e, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var sql = $@"
INSERT INTO {FQN}
( IDPERSONA, IDOTRITTRESOLUCION, IDOTRITTTECNOLOGIA, MONTO, PAGO, COMPLETADO,
  TITULO, DESCRIPCION, ESTADO, FECHAINICIO, FECHAFIN, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @idpersona, @idres, @idtec, @monto, @pago, @completo,
  @titulo, @desc, @estado, @ini, @fin, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(sql, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idpersona", DB2Type.Integer)  { Value = e.IdPersona });
                cmd.Parameters.Add(new DB2Parameter("@idres",     DB2Type.Integer)  { Value = e.IdResolucion });
                cmd.Parameters.Add(new DB2Parameter("@idtec",     DB2Type.Integer)  { Value = e.IdTecnologia });
                cmd.Parameters.Add(new DB2Parameter("@monto",     DB2Type.Decimal)  { Value = (object?)e.Monto ?? DBNull.Value, Precision=15, Scale=2 });
                cmd.Parameters.Add(new DB2Parameter("@pago",      DB2Type.SmallInt) { Value = BoolToSmallInt(e.Pago) });
                cmd.Parameters.Add(new DB2Parameter("@completo",  DB2Type.SmallInt) { Value = BoolToSmallInt(e.Completed) });
                cmd.Parameters.Add(new DB2Parameter("@titulo",    DB2Type.VarChar)  { Value = (object?)e.Titulo ?? string.Empty });
                cmd.Parameters.Add(new DB2Parameter("@desc",      DB2Type.VarChar)  { Value = (object?)e.Descripcion ?? string.Empty });
                cmd.Parameters.Add(new DB2Parameter("@estado",    DB2Type.Char)     { Value = (char)e.Estado });
                cmd.Parameters.Add(new DB2Parameter("@ini",       DB2Type.Date)     { Value = e.FechaInicio.HasValue ? e.FechaInicio.Value.Date : DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@fin",       DB2Type.Date)     { Value = e.FechaFin.HasValue ? e.FechaFin.Value.Date : DBNull.Value });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Identity
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                e.Id = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            // Refrescar timestamps reales
            var back = await GetByIdAsync(e.Id, ct);
            if (back != null)
            {
                e.CreatedAt = back.CreatedAt;
                e.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
            }

            return e.Id;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    /* --------------------------- PATCH -------------------------- */

    public async Task<bool> PatchAsync(int id, IDictionary<string, object?> changes, CancellationToken ct = default)
    {
        if (changes.Count == 0) return true;

        // Asegurar columnas válidas (whitelist)
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "IDPERSONA","IDOTRITTRESOLUCION","IDOTRITTTECNOLOGIA",
            "MONTO","PAGO","COMPLETADO","TITULO","DESCRIPCION","ESTADO","FECHAINICIO","FECHAFIN"
        };

        var sets = new List<string>();
        var parameters = new List<DB2Parameter>();

        foreach (var kv in changes)
        {
            if (!allowed.Contains(kv.Key)) continue;

            var pname = "p_" + kv.Key.ToLowerInvariant();

            // Tipado por columna
            DB2Parameter MakeParam(string col, object? val) => col.ToUpperInvariant() switch
            {
                "IDPERSONA"           => new DB2Parameter(pname, DB2Type.Integer)  { Value = val ?? DBNull.Value },
                "IDOTRITTRESOLUCION"  => new DB2Parameter(pname, DB2Type.Integer)  { Value = val ?? DBNull.Value },
                "IDOTRITTTECNOLOGIA"  => new DB2Parameter(pname, DB2Type.Integer)  { Value = val ?? DBNull.Value },
                "MONTO"               => new DB2Parameter(pname, DB2Type.Decimal)  { Value = val ?? DBNull.Value, Precision=15, Scale=2 },
                "PAGO"                => new DB2Parameter(pname, DB2Type.SmallInt) { Value = (val is int i) ? i : (val is bool b ? BoolToSmallInt(b) : 0) },
                "COMPLETADO"          => new DB2Parameter(pname, DB2Type.SmallInt) { Value = (val is int i2) ? i2 : (val is bool b2 ? BoolToSmallInt(b2) : 0) },
                "TITULO"              => new DB2Parameter(pname, DB2Type.VarChar)  { Value = val ?? string.Empty },
                "DESCRIPCION"         => new DB2Parameter(pname, DB2Type.VarChar)  { Value = val ?? string.Empty },
                "ESTADO"              => new DB2Parameter(pname, DB2Type.Char) 
                { 
                    Value = val is TransferStatus status ? (char)status : 
                           (val is string str && str.Length > 0 ? str[0] : 
                           (val is char c ? c : 'V')) 
                },
                "FECHAINICIO"         => new DB2Parameter(pname, DB2Type.Date)     { Value = val ?? DBNull.Value },
                "FECHAFIN"            => new DB2Parameter(pname, DB2Type.Date)     { Value = val ?? DBNull.Value },
                _ => throw new InvalidOperationException("Columna no permitida.")
            };

            sets.Add($"{kv.Key} = @{pname}");
            parameters.Add(MakeParam(kv.Key, kv.Value));
        }

        if (sets.Count == 0) return true;

        var sql = $@"
UPDATE {FQN}
SET {string.Join(", ", sets)}, ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTTRANSFERTECNOLOGICA = @id";

        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        using var cmd = new DB2Command(sql, conn);
        foreach (var p in parameters) cmd.Parameters.Add(p);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* --------------------------- helpers ------------------------ */

    private static TransferTecnologica MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        static int GetInt32Safe(IDataRecord r, int ord) =>
            r.IsDBNull(ord) ? 0 : Convert.ToInt32(r.GetValue(ord));

        static bool GetBoolFromSmallInt(IDataRecord r, int ord)
        {
            if (r.IsDBNull(ord)) return false;
            var v = r.GetValue(ord);
            return Convert.ToInt32(v) != 0;
        }

        static char GetCharSafe(IDataRecord r, int ord, char fallback = 'V')
        {
            if (r.IsDBNull(ord)) return fallback;
            var v = r.GetValue(ord);
            return Convert.ToChar(v);
        }

        static DateTime? GetNullableDate(IDataRecord r, int ord) =>
            r.IsDBNull(ord) ? (DateTime?)null : Convert.ToDateTime(r.GetValue(ord));

        static DateTime GetDateTimeSafe(IDataRecord r, int ord, DateTime fallbackUtcNow)
        {
            if (r.IsDBNull(ord)) return fallbackUtcNow;
            return Convert.ToDateTime(r.GetValue(ord));
        }

        static string GetStringSafe(IDataRecord r, int ord) =>
            r.IsDBNull(ord) ? string.Empty : Convert.ToString(r.GetValue(ord)) ?? string.Empty;

        static decimal? GetNullableDecimal(IDataRecord r, int ord) =>
            r.IsDBNull(ord) ? (decimal?)null : Convert.ToDecimal(r.GetValue(ord));

        var nowUtc = DateTime.UtcNow;

        return new TransferTecnologica
        {
            Id = GetInt32Safe(rec, Ord("IDOTRITTTRANSFERTECNOLOGICA")),
            IdPersona = GetInt32Safe(rec, Ord("IDPERSONA")),
            IdResolucion = GetInt32Safe(rec, Ord("IDOTRITTRESOLUCION")),
            IdTecnologia = GetInt32Safe(rec, Ord("IDOTRITTTECNOLOGIA")),
            Monto = GetNullableDecimal(rec, Ord("MONTO")),
            Pago = GetBoolFromSmallInt(rec, Ord("PAGO")),
            Completed = GetBoolFromSmallInt(rec, Ord("COMPLETADO")),
            Titulo = GetStringSafe(rec, Ord("TITULO")),
            Descripcion = GetStringSafe(rec, Ord("DESCRIPCION")),
            Estado = (TransferStatus)GetCharSafe(rec, Ord("ESTADO"), 'V'), // Convertir char a enum
            FechaInicio = GetNullableDate(rec, Ord("FECHAINICIO")),
            FechaFin = GetNullableDate(rec, Ord("FECHAFIN")),
            CreatedAt = GetDateTimeSafe(rec, Ord("FECHACREACION"), nowUtc),
            UpdatedAt = GetDateTimeSafe(rec, Ord("ULTIMO_CAMBIO"), nowUtc),
        };
    }

    private static short BoolToSmallInt(bool b) => b ? (short)1 : (short)0;
}