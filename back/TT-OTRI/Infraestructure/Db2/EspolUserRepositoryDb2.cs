using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Db2;

public sealed class EspolUserRepositoryDb2 : IEspolUserRepository
{
    private readonly string _connString;
    private readonly string _schemaEspol;
    private const string TableName = "TBL_PERSONA";
    private string FQN => $"{_schemaEspol}.{TableName}";

    public EspolUserRepositoryDb2(IConfiguration cfg)
    {
        // Puedes mover a appsettings.json si prefieres. Aquí sigo tu estilo.
        _connString  = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schemaEspol = "ESPOL";
    }

    public async Task<EspolUser?> GetByIdAsync(int idPersona, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  p.IDPERSONA,
  p.NUMEROIDENTIFICACION,
  p.APELLIDOS,
  p.NOMBRES,
  p.EMAIL
FROM {FQN} p
WHERE p.IDPERSONA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = idPersona });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        if (!await rdr.ReadAsync(ct)) return null;

        return MapWithRid(rdr);
    }

    public async Task<List<EspolUser>> SearchByEmailPrefixAsync(string prefix, int limit, CancellationToken ct = default)
    {
        // Sin índices: será table scan. Mantén limit pequeño.
        limit = Math.Clamp(limit, 1, 25);
        var like = (prefix ?? string.Empty).Trim();
        if (like.Length < 2) return new List<EspolUser>(); // evita full scans por 1 char

        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Case-insensitive con UPPER(); sin índice funcional, DB2 hará scan.
        var sql = $@"
SELECT
  p.IDPERSONA,
  p.APELLIDOS,
  p.NOMBRES,
  p.EMAIL
FROM {FQN} p
WHERE UPPER(p.EMAIL) LIKE @like
ORDER BY p.EMAIL, p.IDPERSONA
FETCH FIRST {limit} ROWS ONLY";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@like", DB2Type.VarChar)
        {
            Value = like.ToUpperInvariant() + "%"
        });

        var list = new List<EspolUser>();
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        while (await rdr.ReadAsync(ct))
        {
            list.Add(new EspolUser
            {
                IdPersona = rdr.GetInt32(rdr.GetOrdinal("IDPERSONA")),
                Apellidos = rdr["APELLIDOS"] as string ?? "",
                Nombres   = rdr["NOMBRES"]   as string ?? "",
                Email     = rdr["EMAIL"]     as string ?? ""
            });
        }
        return list;
    }

    public async Task<int?> GetIdPersonaByEmailAsync(string email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
    
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
    
        var sql = $@"
    SELECT p.IDPERSONA
    FROM {FQN} p
    WHERE UPPER(p.EMAIL) = @email
    FETCH FIRST 1 ROWS ONLY";
    
        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@email", DB2Type.VarChar)
        {
            Value = email.Trim().ToUpperInvariant()
        });
    
        var result = await cmd.ExecuteScalarAsync(ct);
        if (result is int id) return id;
        if (result is long l) return unchecked((int)l);
        if (result is decimal d) return (int)d;
        if (result is null || result == DBNull.Value) return null;
    
        // fallback genérico
        return Convert.ToInt32(result);
    }

    
    /* --------------------------- Mappers --------------------------- */

    private static EspolUser MapWithRid(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);
        byte[] ReadBytes(string col)
        {
            int ord = Ord(col);
            if (rec.IsDBNull(ord)) return Array.Empty<byte>();
            int len = (int)rec.GetBytes(ord, 0, null, 0, 0);
            var buf = new byte[len];
            rec.GetBytes(ord, 0, buf, 0, len);
            return buf;
        }

        return new EspolUser
        {
            IdPersona        = rec.GetInt32(Ord("IDPERSONA")),
            NumeroIdentificacion = rec["NUMEROIDENTIFICACION"] as string ?? "",
            Apellidos        = rec["APELLIDOS"]        as string ?? "",
            Nombres          = rec["NOMBRES"]          as string ?? "",
            Email            = rec["EMAIL"]            as string ?? ""
        };
    }
}
