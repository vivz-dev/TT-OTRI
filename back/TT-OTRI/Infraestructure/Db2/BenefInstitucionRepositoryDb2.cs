// ============================================================================
// Infrastructure/Db2/BenefInstitucionRepositoryDb2.cs  (FIX: DbDataReader)
// ============================================================================
using System.Data.Common;
using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.Db2;

public sealed class BenefInstitucionRepositoryDb2 : IBenefInstitucionRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_BENEF_INSTITUCION";

    public BenefInstitucionRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    private string Table => $"{_schema}.T_OTRI_TT_BENEF_INSTITUCION";

    public async Task<IReadOnlyList<BenefInstitucion>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
            SELECT IDOTRIBENEFINSTITUCION, NOMBRE, FECHACREACION, ULTIMO_CAMBIO
            FROM {Table}
            ORDER BY NOMBRE";

        using var cmd = new DB2Command(sql, conn);
        using var rd = await cmd.ExecuteReaderAsync(ct); // DbDataReader

        var list = new List<BenefInstitucion>();
        while (await rd.ReadAsync(ct))
        {
            list.Add(Map(rd));
        }
        return list;
    }

    public async Task<BenefInstitucion?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
            SELECT IDOTRIBENEFINSTITUCION, NOMBRE, FECHACREACION, ULTIMO_CAMBIO
            FROM {Table}
            WHERE IDOTRIBENEFINSTITUCION = @p_id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@p_id", id));

        using var rd = await cmd.ExecuteReaderAsync(ct); // DbDataReader
        if (await rd.ReadAsync(ct))
            return Map(rd);

        return null;
    }

    public async Task<int> CreateAsync(BenefInstitucion entity, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
            INSERT INTO {Table} (NOMBRE, FECHACREACION, ULTIMO_CAMBIO)
            VALUES (@p_nombre, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

        using (var cmd = new DB2Command(sql, conn))
        {
            cmd.Parameters.Add(new DB2Parameter("@p_nombre", entity.Nombre));
            var rows = await cmd.ExecuteNonQueryAsync(ct);
            if (rows <= 0) throw new InvalidOperationException("No se insertó ningún registro.");
        }

        // Recupera el último IDENTITY del scope de esta conexión.
        using var cmdId = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn);
        var val = await cmdId.ExecuteScalarAsync(ct);

        if (val is IConvertible)
            return Convert.ToInt32(val);

        throw new InvalidOperationException("No se pudo obtener el ID generado.");
    }

    public async Task<bool> UpdateAsync(BenefInstitucion entity, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
            UPDATE {Table}
               SET NOMBRE = @p_nombre,
                   ULTIMO_CAMBIO = CURRENT_TIMESTAMP
             WHERE IDOTRIBENEFINSTITUCION = @p_id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@p_nombre", entity.Nombre));
        cmd.Parameters.Add(new DB2Parameter("@p_id", entity.Id));

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"DELETE FROM {Table} WHERE IDOTRIBENEFINSTITUCION = @p_id";
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@p_id", id));

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    // --- Map ahora acepta DbDataReader (tipo base) ---
    private static BenefInstitucion Map(DbDataReader rd)
    {
        int iId      = rd.GetOrdinal("IDOTRIBENEFINSTITUCION");
        int iNombre  = rd.GetOrdinal("NOMBRE");
        int iFecCrea = rd.GetOrdinal("FECHACREACION");
        int iUltCamb = rd.GetOrdinal("ULTIMO_CAMBIO");

        return new BenefInstitucion
        {
            Id            = rd.GetInt32(iId),
            Nombre        = rd.IsDBNull(iNombre) ? string.Empty : rd.GetString(iNombre),
            FechaCreacion = rd.IsDBNull(iFecCrea) ? (DateTime?)null : rd.GetDateTime(iFecCrea),
            UltimoCambio  = rd.IsDBNull(iUltCamb) ? (DateTime?)null : rd.GetDateTime(iUltCamb),
        };
    }
}
