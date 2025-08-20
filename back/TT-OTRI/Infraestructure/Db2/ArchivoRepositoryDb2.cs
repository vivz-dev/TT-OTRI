using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;
using System.Data.Common;

namespace TT_OTRI.Infrastructure.Db2;

public sealed class ArchivoRepositoryDb2 : IArchivoRepository
{
    private readonly string _connString;
    private readonly string _schema;

    public ArchivoRepositoryDb2(IConfiguration cfg)
    {
        _connString = cfg.GetConnectionString("Db2")
                      ?? throw new InvalidOperationException("Falta ConnectionStrings:Db2");
        _schema = "SOTRI";
    }

    private static Archivo Map(DbDataReader r)
    {
        int GetOrdinal(string name) => r.GetOrdinal(name);

        return new Archivo
        {
            Id            = r.IsDBNull(GetOrdinal("IDOTRITTARCHIVO")) ? 0  : r.GetInt32(GetOrdinal("IDOTRITTARCHIVO")),
            Tamano        = r.IsDBNull(GetOrdinal("TAMANIO"))         ? null : r.GetInt32(GetOrdinal("TAMANIO")),
            IdTEntidad    = r.IsDBNull(GetOrdinal("IDTTENTIDAD"))     ? null : r.GetInt32(GetOrdinal("IDTTENTIDAD")),
            Nombre        = r.IsDBNull(GetOrdinal("NOMBRE"))          ? null : r.GetString(GetOrdinal("NOMBRE")),
            Formato       = r.IsDBNull(GetOrdinal("FORMATO"))         ? null : r.GetString(GetOrdinal("FORMATO")),
            Url           = r.IsDBNull(GetOrdinal("URL"))             ? null : r.GetString(GetOrdinal("URL")),
            FechaCreacion = r.IsDBNull(GetOrdinal("FECHACREACION"))   ? null : r.GetDateTime(GetOrdinal("FECHACREACION")),
            UltimoCambio  = r.IsDBNull(GetOrdinal("ULTIMO_CAMBIO"))   ? null : r.GetDateTime(GetOrdinal("ULTIMO_CAMBIO")),
            TipoEntidad   = r.IsDBNull(GetOrdinal("TIPOENTIDAD"))     ? null : r.GetString(GetOrdinal("TIPOENTIDAD")) // 🆕
        };
    }

    public async Task<IReadOnlyList<Archivo>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        string sql = $@"
            SELECT IDOTRITTARCHIVO, TAMANIO, IDTTENTIDAD, NOMBRE, FORMATO, URL, FECHACREACION, ULTIMO_CAMBIO, TIPOENTIDAD
            FROM {_schema}.T_OTRI_TT_ARCHIVO
            ORDER BY IDOTRITTARCHIVO DESC";

        using var cmd = new DB2Command(sql, conn);
        using var rd = await cmd.ExecuteReaderAsync(ct);
        var list = new List<Archivo>();
        while (await rd.ReadAsync(ct))
            list.Add(Map(rd));
        return list;
    }

    public async Task<Archivo?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        string sql = $@"
            SELECT IDOTRITTARCHIVO, TAMANIO, IDTTENTIDAD, NOMBRE, FORMATO, URL, FECHACREACION, ULTIMO_CAMBIO, TIPOENTIDAD
            FROM {_schema}.T_OTRI_TT_ARCHIVO
            WHERE IDOTRITTARCHIVO = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", id));

        using var rd = await cmd.ExecuteReaderAsync(ct);
        if (await rd.ReadAsync(ct))
            return Map(rd);

        return null;
    }

    private async Task<int> GetNextIdAsync(DB2Connection conn, DB2Transaction tx, CancellationToken ct)
    {
        // Estrategia genérica si la tabla no es IDENTITY
        string sqlNext = $@"SELECT COALESCE(MAX(IDOTRITTARCHIVO), 0) + 1
                            FROM {_schema}.T_OTRI_TT_ARCHIVO WITH UR";
        using var cmd = new DB2Command(sqlNext, conn, tx);
        var raw = await cmd.ExecuteScalarAsync(ct);
        return Convert.ToInt32(raw);
    }

    public async Task<int> CreateAsync(Archivo e, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        using var tx = conn.BeginTransaction();

        try
        {
            // Si tu tabla es IDENTITY, puedes omitir esto y usar IDENTITY_VAL_LOCAL().
            int id = await GetNextIdAsync(conn, tx, ct);

            string sql = $@"
                INSERT INTO {_schema}.T_OTRI_TT_ARCHIVO
    (IDOTRITTARCHIVO, TAMANIO, IDTTENTIDAD, NOMBRE, FORMATO, URL, FECHACREACION, ULTIMO_CAMBIO, TIPOENTIDAD)
    VALUES
    (@id, @tam, @idten, @nombre, @formato, @url, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @tipo)";

            using var cmd = new DB2Command(sql, conn, tx);
            cmd.Parameters.Add(new DB2Parameter("@id", id));
            cmd.Parameters.Add(new DB2Parameter("@tam",    (object?)e.Tamano     ?? DBNull.Value));
            cmd.Parameters.Add(new DB2Parameter("@idten",  (object?)e.IdTEntidad ?? DBNull.Value));
            cmd.Parameters.Add(new DB2Parameter("@nombre", (object?)e.Nombre     ?? DBNull.Value));
            cmd.Parameters.Add(new DB2Parameter("@formato",(object?)e.Formato    ?? DBNull.Value));
            cmd.Parameters.Add(new DB2Parameter("@url",    (object?)e.Url        ?? DBNull.Value));
            cmd.Parameters.Add(new DB2Parameter("@tipo", (object?)e.TipoEntidad ?? DBNull.Value));


            await cmd.ExecuteNonQueryAsync(ct);
            await tx.CommitAsync(ct);
            return id;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> UpdatePartialAsync(int id, Archivo patch, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        using var tx = conn.BeginTransaction();

        try
        {
            var sets = new List<string>();
            using var cmd = new DB2Command { Connection = conn, Transaction = tx };

            if (patch.Tamano.HasValue)
            {
                sets.Add("TAMANIO = @tam");
                cmd.Parameters.Add(new DB2Parameter("@tam", patch.Tamano.Value));
            }
            if (patch.IdTEntidad.HasValue)
            {
                sets.Add("IDTTENTIDAD = @idten");
                cmd.Parameters.Add(new DB2Parameter("@idten", patch.IdTEntidad.Value));
            }
            if (patch.Nombre != null)
            {
                sets.Add("NOMBRE = @nombre");
                cmd.Parameters.Add(new DB2Parameter("@nombre", (object?)patch.Nombre ?? DBNull.Value));
            }
            if (patch.Formato != null)
            {
                sets.Add("FORMATO = @formato");
                cmd.Parameters.Add(new DB2Parameter("@formato", (object?)patch.Formato ?? DBNull.Value));
            }
            if (patch.Url != null)
            {
                sets.Add("URL = @url");
                cmd.Parameters.Add(new DB2Parameter("@url", (object?)patch.Url ?? DBNull.Value));
            }
            if (patch.TipoEntidad != null)
            {
                sets.Add("TIPOENTIDAD = @tipo");
                cmd.Parameters.Add(new DB2Parameter("@tipo", (object?)patch.TipoEntidad ?? DBNull.Value));
            }


            // Siempre refrescamos ULTIMO_CAMBIO
            sets.Add("ULTIMO_CAMBIO = CURRENT_TIMESTAMP");

            string sql = $@"
                UPDATE {_schema}.T_OTRI_TT_ARCHIVO
                SET {string.Join(", ", sets)}
                WHERE IDOTRITTARCHIVO = @id";

            cmd.CommandText = sql;
            cmd.Parameters.Add(new DB2Parameter("@id", id));

            int rows = await cmd.ExecuteNonQueryAsync(ct);
            await tx.CommitAsync(ct);
            return rows > 0;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }
}
