// ============================================================================
// Infrastructure/Repositories/AutorRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class AutorRepositoryDb2 : IAutorRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_AUTOR";
    private string FQN => $"{_schema}.{TableName}";

    public AutorRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* ----------------------------- LECTURA ----------------------------- */

    public async Task<IReadOnlyList<AutorReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTAUTOR, IDOTRITTACUERDODISTRIBAUTORES, IDUNIDAD, IDPERSONA,
  PORCAUTOR, PORCUNIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTAUTOR DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<AutorReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<AutorReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTAUTOR, IDOTRITTACUERDODISTRIBAUTORES, IDUNIDAD, IDPERSONA,
  PORCAUTOR, PORCUNIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTAUTOR = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<IReadOnlyList<AutorReadDto>> GetByAcuerdoDistribAsync(int idAcuerdoDistrib, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTAUTOR, IDOTRITTACUERDODISTRIBAUTORES, IDUNIDAD, IDPERSONA,
  PORCAUTOR, PORCUNIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTACUERDODISTRIBAUTORES = @idAcuerdoDistrib
ORDER BY IDOTRITTAUTOR DESC";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idAcuerdoDistrib", DB2Type.Integer) { Value = idAcuerdoDistrib });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<AutorReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<IReadOnlyList<AutorReadDto>> GetByUnidadAsync(int idUnidad, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTAUTOR, IDOTRITTACUERDODISTRIBAUTORES, IDUNIDAD, IDPERSONA,
  PORCAUTOR, PORCUNIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDUNIDAD = @idUnidad
ORDER BY IDOTRITTAUTOR DESC";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idUnidad", DB2Type.Integer) { Value = idUnidad });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<AutorReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<IReadOnlyList<AutorReadDto>> GetByPersonaAsync(int idPersona, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTAUTOR, IDOTRITTACUERDODISTRIBAUTORES, IDUNIDAD, IDPERSONA,
  PORCAUTOR, PORCUNIDAD, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDPERSONA = @idPersona
ORDER BY IDOTRITTAUTOR DESC";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idPersona", DB2Type.Integer) { Value = idPersona });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<AutorReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    /* ----------------------------- ESCRITURA --------------------------- */

    public async Task<int> CreateAsync(AutorCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            int newId;

            // Si no se especifica ID, calculamos MAX+1
            if (!dto.IdOtriTtAutor.HasValue)
            {
                var maxIdSql = $"SELECT COALESCE(MAX(IDOTRITTAUTOR), 0) FROM {FQN}";
                using var maxCmd = new DB2Command(maxIdSql, conn);
                maxCmd.Transaction = (DB2Transaction)tx;
                var maxObj = await maxCmd.ExecuteScalarAsync(ct);
                newId = Convert.ToInt32(maxObj) + 1;
            }
            else
            {
                newId = dto.IdOtriTtAutor.Value;
            }

            var insertSql = $@"
INSERT INTO {FQN}
( IDOTRITTAUTOR, IDOTRITTACUERDODISTRIBAUTORES, IDUNIDAD, IDPERSONA,
  PORCAUTOR, PORCUNIDAD, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @id, @idAcuerdoDistrib, @idUnidad, @idPersona,
  @porcAutor, @porcUnidad, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insertSql, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = newId });
                cmd.Parameters.Add(new DB2Parameter("@idAcuerdoDistrib", DB2Type.Integer) { Value = dto.IdOtriTtAcuerdoDistribAutores });
                cmd.Parameters.Add(new DB2Parameter("@idUnidad", DB2Type.Integer) { Value = dto.IdUnidad });
                cmd.Parameters.Add(new DB2Parameter("@idPersona", DB2Type.Integer) { Value = dto.IdPersona });
                cmd.Parameters.Add(new DB2Parameter("@porcAutor", DB2Type.Decimal) 
                { 
                    Value = dto.PorcAutor.HasValue ? dto.PorcAutor.Value : DBNull.Value 
                });
                cmd.Parameters.Add(new DB2Parameter("@porcUnidad", DB2Type.Decimal) 
                { 
                    Value = dto.PorcUnidad.HasValue ? dto.PorcUnidad.Value : DBNull.Value 
                });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            await tx.CommitAsync(ct);
            return newId;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<bool> PatchAsync(int id, AutorPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        // Construir dinámicamente el UPDATE solo con campos que no sean null
        var setParts = new List<string>();
        var parameters = new List<DB2Parameter>();

        if (dto.IdOtriTtAcuerdoDistribAutores.HasValue)
        {
            setParts.Add("IDOTRITTACUERDODISTRIBAUTORES = @idAcuerdoDistrib");
            parameters.Add(new DB2Parameter("@idAcuerdoDistrib", DB2Type.Integer) { Value = dto.IdOtriTtAcuerdoDistribAutores.Value });
        }

        if (dto.IdUnidad.HasValue)
        {
            setParts.Add("IDUNIDAD = @idUnidad");
            parameters.Add(new DB2Parameter("@idUnidad", DB2Type.Integer) { Value = dto.IdUnidad.Value });
        }

        if (dto.IdPersona.HasValue)
        {
            setParts.Add("IDPERSONA = @idPersona");
            parameters.Add(new DB2Parameter("@idPersona", DB2Type.Integer) { Value = dto.IdPersona.Value });
        }

        if (dto.PorcAutor.HasValue)
        {
            setParts.Add("PORCAUTOR = @porcAutor");
            parameters.Add(new DB2Parameter("@porcAutor", DB2Type.Decimal) { Value = dto.PorcAutor.Value });
        }

        if (dto.PorcUnidad.HasValue)
        {
            setParts.Add("PORCUNIDAD = @porcUnidad");
            parameters.Add(new DB2Parameter("@porcUnidad", DB2Type.Decimal) { Value = dto.PorcUnidad.Value });
        }

        if (setParts.Count == 0) return true; // No hay nada que actualizar

        // Siempre actualizamos ULTIMO_CAMBIO
        setParts.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");

        var sql = $@"
UPDATE {FQN} SET
  {string.Join(", ", setParts)}
WHERE IDOTRITTAUTOR = @id";

        using var cmd = new DB2Command(sql, conn);
        parameters.ForEach(p => cmd.Parameters.Add(p));
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $"DELETE FROM {FQN} WHERE IDOTRITTAUTOR = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* --------------------------- HELPERS -------------------------------- */

    private static AutorReadDto MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new AutorReadDto
        {
            IdOtriTtAutor                = rec.GetInt32(Ord("IDOTRITTAUTOR")),
            IdOtriTtAcuerdoDistribAutores = rec.GetInt32(Ord("IDOTRITTACUERDODISTRIBAUTORES")),
            IdUnidad                     = rec.GetInt32(Ord("IDUNIDAD")),
            IdPersona                    = rec.GetInt32(Ord("IDPERSONA")),
            PorcAutor                    = rec.IsDBNull(Ord("PORCAUTOR")) ? null : rec.GetDecimal(Ord("PORCAUTOR")),
            PorcUnidad                   = rec.IsDBNull(Ord("PORCUNIDAD")) ? null : rec.GetDecimal(Ord("PORCUNIDAD")),
            FechaCreacion                = rec.GetDateTime(Ord("FECHACREACION")),
            UltimoCambio                 = rec.GetDateTime(Ord("ULTIMO_CAMBIO"))
        };
    }
}