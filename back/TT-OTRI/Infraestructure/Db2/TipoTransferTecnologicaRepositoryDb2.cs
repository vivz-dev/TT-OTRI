// ============================================================================
// Infrastructure/Repositories/TipoTransferTecnologicaRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class TipoTransferTecnologicaRepositoryDb2 : ITipoTransferTecnologicaRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_TIPO_TRANSFER_TECNOLOGICA";
    private string FQN => $"{_schema}.{TableName}";

    public TipoTransferTecnologicaRepositoryDb2(IConfiguration cfg)
    {
        // Ajusta según tu composición real de AddDb2(cfg)
        _connString = cfg.GetConnectionString("DB2") 
                      ?? "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = cfg["Db2:Schema"] ?? "SOTRI";
    }

    /* ----------------------------- READ ----------------------------- */
    public async Task<IReadOnlyList<TipoTransferTecnologica>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTTIPOTRANSFERTECNOLOGICA, NOMBRE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTTIPOTRANSFERTECNOLOGICA DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<TipoTransferTecnologica>();
        while (await rdr.ReadAsync(ct))
            list.Add(Map(rdr));
        return list;
    }

    public async Task<TipoTransferTecnologica?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTTIPOTRANSFERTECNOLOGICA, NOMBRE, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTTIPOTRANSFERTECNOLOGICA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? Map(rdr) : null;
    }

    /* ----------------------------- WRITE ---------------------------- */
    public async Task<int> CreateAsync(TipoTransferTecnologica e, CancellationToken ct = default)
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
                // VARGRAPHIC(100) → usar VarGraphic para evitar conversiones
                cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarGraphic) { Value = e.Nombre ?? string.Empty });
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

            // Sync timestamps
            var back = await GetByIdAsync(newId, ct);
            if (back != null)
            {
                e.Id        = back.Id;
                e.CreatedAt = back.CreatedAt;
                e.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                e.Id        = newId;
                e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
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
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Construcción dinámica simple (solo nombre es parcheable por ahora)
        var setClauses = new List<string>();
        var prms = new List<DB2Parameter>();

        if (nombre is not null)
        {
            setClauses.Add("NOMBRE = @nombre");
            prms.Add(new DB2Parameter("@nombre", DB2Type.VarGraphic) { Value = nombre });
        }

        if (setClauses.Count == 0) return true; // nada que actualizar → idempotente

        setClauses.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");
        var sql = $@"UPDATE {FQN} SET {string.Join(", ", setClauses)} WHERE IDOTRITTTIPOTRANSFERTECNOLOGICA = @id";

        using var cmd = new DB2Command(sql, conn);
        foreach (var p in prms) cmd.Parameters.Add(p);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* ----------------------------- MAP ------------------------------ */
    private static TipoTransferTecnologica Map(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new TipoTransferTecnologica
        {
            Id        = rec.GetInt32(Ord("IDOTRITTTIPOTRANSFERTECNOLOGICA")),
            Nombre    = rec["NOMBRE"] as string ?? string.Empty,
            CreatedAt = (DateTime)rec["FECHACREACION"],
            UpdatedAt = (DateTime)rec["ULTIMO_CAMBIO"]
        };
    }
}
