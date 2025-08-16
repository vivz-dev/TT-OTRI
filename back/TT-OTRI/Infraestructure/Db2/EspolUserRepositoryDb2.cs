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
        // Puedes mover a appsettings.json si prefieres. Sigo tu ejemplo hardcodeado.
        _connString  = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schemaEspol = "ESPOL";
    }

    public async Task<EspolUser?> GetByIdAsync(int idPersona, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Solo columnas resaltadas + RID_BIT
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

        return Map(rdr);
    }

    /* --------------------------- Mapper --------------------------- */
    private static EspolUser Map(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        byte[] ReadBytes(string col)
        {
            var ordinal = Ord(col);
            if (rec.IsDBNull(ordinal)) return Array.Empty<byte>();
            var len = (int)rec.GetBytes(ordinal, 0, null, 0, 0);
            var buffer = new byte[len];
            rec.GetBytes(ordinal, 0, buffer, 0, len);
            return buffer;
        }

        return new EspolUser
        {
            IdPersona        = rec.GetInt32(Ord("IDPERSONA")),
            NumeroIdentificacion = rec["NUMEROIDENTIFICACION"] as string ?? "",
            Apellidos        = rec["APELLIDOS"]        as string ?? "",
            Nombres          = rec["NOMBRES"]          as string ?? "",
            Email            = rec["EMAIL"]            as string ?? "",
        };
    }
}
