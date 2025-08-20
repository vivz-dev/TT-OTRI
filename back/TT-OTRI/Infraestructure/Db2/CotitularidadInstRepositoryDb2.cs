// Infrastructure/Repositories/CotitularidadInstRepositoryDb2.cs
using System.Data;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class CotitularidadInstRepositoryDb2 : ICotitularidadInstRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_COTITULARIDAD_INST";
    private string FQN => $"{_schema}.{TableName}";

    public CotitularidadInstRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<CotitularidadInst>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
    IDOTRITTCOTITULARINST,
    NOMBRE,
    CORREO,
    RUC,
    FECHACREACION,
    ULTIMO_CAMBIO
FROM {FQN}";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<CotitularidadInst>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        
        return list;
    }

    public async Task<CotitularidadInst?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT 
    IDOTRITTCOTITULARINST,
    NOMBRE,
    CORREO,
    RUC,
    FECHACREACION,
    ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTCOTITULARINST = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> AddAsync(CotitularidadInst entity, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        
        var sql = $@"
INSERT INTO {FQN}
    (NOMBRE, CORREO, RUC, FECHACREACION, ULTIMO_CAMBIO)
VALUES
    (@nombre, @correo, @ruc, CURRENT TIMESTAMP, CURRENT TIMESTAMP)";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarChar) { Value = entity.Nombre });
        cmd.Parameters.Add(new DB2Parameter("@correo", DB2Type.VarChar) { Value = entity.Correo });
        cmd.Parameters.Add(new DB2Parameter("@ruc", DB2Type.VarChar) { Value = entity.Ruc });

        await cmd.ExecuteNonQueryAsync(ct);

        // Obtener ID generado
        using var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
        var result = await idCmd.ExecuteScalarAsync(ct);
        return Convert.ToInt32(result);
    }

    public async Task<bool> UpdateAsync(CotitularidadInst entity, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
    NOMBRE = @nombre,
    CORREO = @correo,
    RUC = @ruc,
    ULTIMO_CAMBIO = CURRENT TIMESTAMP
WHERE IDOTRITTCOTITULARINST = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@nombre", DB2Type.VarChar) { Value = entity.Nombre });
        cmd.Parameters.Add(new DB2Parameter("@correo", DB2Type.VarChar) { Value = entity.Correo });
        cmd.Parameters.Add(new DB2Parameter("@ruc", DB2Type.VarChar) { Value = entity.Ruc });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = entity.Id });

        var affected = await cmd.ExecuteNonQueryAsync(ct);
        return affected > 0;
    }

    private static CotitularidadInst MapFromRecord(IDataRecord rec)
    {
        return new CotitularidadInst
        {
            Id = rec.GetInt32(rec.GetOrdinal("IDOTRITTCOTITULARINST")),
            Nombre = rec["NOMBRE"] as string ?? string.Empty,
            Correo = rec["CORREO"] as string ?? string.Empty,
            Ruc = rec["RUC"] as string ?? string.Empty,
            FechaCreacion = (DateTime)rec["FECHACREACION"],
            UltimoCambio = (DateTime)rec["ULTIMO_CAMBIO"]
        };
    }
}