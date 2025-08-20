// Infrastructure/Repositories/DistribPagoRepositoryDb2.cs
using System.Data;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class DistribPagoRepositoryDb2 : IDistribPagoRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_DISTRIB_PAGO";
    private string FQN => $"{_schema}.{TableName}";

    public DistribPagoRepositoryDb2(IConfiguration cfg)
    {
        _connString = cfg.GetConnectionString("Db2")!;
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<DistribPago>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
    IDOTRITTDISTRIBPAGO,
    IDOTRITTFACTURA,
    IDOTRITTTIPOTRANSFERTECNOLOGICA,
    IDOTRITTAUTOR,
    MONTOTOTAL,
    MONTOAUTOR,
    MONTOCENTRO,
    FECHACREACION,
    ULTIMO_CAMBIO
FROM {FQN}";

        using var cmd = new DB2Command(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync(ct);
        
        var results = new List<DistribPago>();
        while (await reader.ReadAsync(ct))
        {
            results.Add(MapFromReader(reader));
        }
        return results;
    }

    public async Task<DistribPago?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
    IDOTRITTDISTRIBPAGO,
    IDOTRITTFACTURA,
    IDOTRITTTIPOTRANSFERTECNOLOGICA,
    IDOTRITTAUTOR,
    MONTOTOTAL,
    MONTOAUTOR,
    MONTOCENTRO,
    FECHACREACION,
    ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTDISTRIBPAGO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add("@id", DB2Type.Integer).Value = id;
        
        using var reader = await cmd.ExecuteReaderAsync(ct);
        return await reader.ReadAsync(ct) 
            ? MapFromReader(reader)
            : null;
    }

    public async Task<int> CreateAsync(DistribPago distribPago, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
INSERT INTO {FQN} (
    IDOTRITTFACTURA,
    IDOTRITTTIPOTRANSFERTECNOLOGICA,
    IDOTRITTAUTOR,
    MONTOTOTAL,
    MONTOAUTOR,
    MONTOCENTRO
) VALUES (
    @idFactura,
    @idTipoTransferencia,
    @idAutor,
    @montoTotal,
    @montoAutor,
    @montoCentro
)";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add("@idFactura", DB2Type.Integer).Value = distribPago.IdFactura;
        cmd.Parameters.Add("@idTipoTransferencia", DB2Type.Integer).Value = distribPago.IdTipoTransferencia;
        cmd.Parameters.Add("@idAutor", DB2Type.Integer).Value = distribPago.IdAutor;
        cmd.Parameters.Add("@montoTotal", DB2Type.Decimal).Value = distribPago.MontoTotal;
        cmd.Parameters.Add("@montoAutor", DB2Type.Decimal).Value = distribPago.MontoAutor;
        cmd.Parameters.Add("@montoCentro", DB2Type.Decimal).Value = distribPago.MontoCentro;

        await cmd.ExecuteNonQueryAsync(ct);
        
        // Obtener ID generado
        using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
        return Convert.ToInt32(await idCmd.ExecuteScalarAsync(ct));
    }

    public async Task<bool> UpdateAsync(int id, DistribPago distribPago, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
    IDOTRITTFACTURA = @idFactura,
    IDOTRITTTIPOTRANSFERTECNOLOGICA = @idTipoTransferencia,
    IDOTRITTAUTOR = @idAutor,
    MONTOTOTAL = @montoTotal,
    MONTOAUTOR = @montoAutor,
    MONTOCENTRO = @montoCentro,
    ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTDISTRIBPAGO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add("@idFactura", DB2Type.Integer).Value = distribPago.IdFactura;
        cmd.Parameters.Add("@idTipoTransferencia", DB2Type.Integer).Value = distribPago.IdTipoTransferencia;
        cmd.Parameters.Add("@idAutor", DB2Type.Integer).Value = distribPago.IdAutor;
        cmd.Parameters.Add("@montoTotal", DB2Type.Decimal).Value = distribPago.MontoTotal;
        cmd.Parameters.Add("@montoAutor", DB2Type.Decimal).Value = distribPago.MontoAutor;
        cmd.Parameters.Add("@montoCentro", DB2Type.Decimal).Value = distribPago.MontoCentro;
        cmd.Parameters.Add("@id", DB2Type.Integer).Value = id;

        return await cmd.ExecuteNonQueryAsync(ct) > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $"DELETE FROM {FQN} WHERE IDOTRITTDISTRIBPAGO = @id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add("@id", DB2Type.Integer).Value = id;

        return await cmd.ExecuteNonQueryAsync(ct) > 0;
    }

    private DistribPago MapFromReader(IDataReader reader)
    {
        return new DistribPago
        {
            Id = reader.GetInt32(0),
            IdFactura = reader.GetInt32(1),
            IdTipoTransferencia = reader.GetInt32(2),
            IdAutor = reader.GetInt32(3),
            MontoTotal = reader.GetDecimal(4),
            MontoAutor = reader.GetDecimal(5),
            MontoCentro = reader.GetDecimal(6),
            FechaCreacion = reader.GetDateTime(7),
            UltimoCambio = reader.GetDateTime(8)
        };
    }
}