// ============================================================================
// Infrastructure/Repositories/EspecialistaRepositoryDb2.cs
// ============================================================================
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class EspecialistaRepositoryDb2 : IEspecialistaRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_ESPECIALISTA";
    private string FQN => $"{_schema}.{TableName}";

    public EspecialistaRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    /* ----------------------------- LECTURA ----------------------------- */

    public async Task<IReadOnlyList<EspecialistaReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTESPECIALISTA, NOMBRES, APELLIDOS, IDENTIFICACION, CORREO,
  TELEFONO, TIPO, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTESPECIALISTA DESC";

        using var cmd = new DB2Command(sql, conn);
        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<EspecialistaReadDto>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<EspecialistaReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTESPECIALISTA, NOMBRES, APELLIDOS, IDENTIFICACION, CORREO,
  TELEFONO, TIPO, FECHACREACION, ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTESPECIALISTA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        using var rdr = (DB2DataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    /* ----------------------------- ESCRITURA --------------------------- */

    public async Task<int> CreateAsync(EspecialistaCreateDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        using var tx = (DB2Transaction)await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( NOMBRES, APELLIDOS, IDENTIFICACION, CORREO, TELEFONO, TIPO, FECHACREACION, ULTIMO_CAMBIO )
VALUES
( @nombres, @apellidos, @identificacion, @correo, @telefono, @tipo, CURRENT TIMESTAMP, CURRENT TIMESTAMP )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = tx;
                cmd.Parameters.Add(new DB2Parameter("@nombres", DB2Type.VarGraphic) { Value = dto.Nombres ?? (object)DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@apellidos", DB2Type.VarGraphic) { Value = dto.Apellidos ?? (object)DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@identificacion", DB2Type.VarGraphic) { Value = dto.Identificacion ?? (object)DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@correo", DB2Type.VarGraphic) { Value = dto.Correo ?? (object)DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@telefono", DB2Type.VarGraphic) { Value = dto.Telefono ?? (object)DBNull.Value });
                cmd.Parameters.Add(new DB2Parameter("@tipo", DB2Type.VarChar) { Value = dto.Tipo ?? "ADC" });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            // Obtener ID autogenerado
            int newId;
            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                newId = Convert.ToInt32(obj);
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

    public async Task<bool> PatchAsync(int id, EspecialistaPatchDto dto, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var setParts = new List<string>();
        var parameters = new List<DB2Parameter>();

        if (!string.IsNullOrEmpty(dto.Nombres))
        {
            setParts.Add("NOMBRES = @nombres");
            parameters.Add(new DB2Parameter("@nombres", DB2Type.VarGraphic) { Value = dto.Nombres });
        }
        if (!string.IsNullOrEmpty(dto.Apellidos))
        {
            setParts.Add("APELLIDOS = @apellidos");
            parameters.Add(new DB2Parameter("@apellidos", DB2Type.VarGraphic) { Value = dto.Apellidos });
        }
        if (!string.IsNullOrEmpty(dto.Identificacion))
        {
            setParts.Add("IDENTIFICACION = @identificacion");
            parameters.Add(new DB2Parameter("@identificacion", DB2Type.VarGraphic) { Value = dto.Identificacion });
        }
        if (!string.IsNullOrEmpty(dto.Correo))
        {
            setParts.Add("CORREO = @correo");
            parameters.Add(new DB2Parameter("@correo", DB2Type.VarGraphic) { Value = dto.Correo });
        }
        if (!string.IsNullOrEmpty(dto.Telefono))
        {
            setParts.Add("TELEFONO = @telefono");
            parameters.Add(new DB2Parameter("@telefono", DB2Type.VarGraphic) { Value = dto.Telefono });
        }
        if (!string.IsNullOrEmpty(dto.Tipo))
        {
            setParts.Add("TIPO = @tipo");
            parameters.Add(new DB2Parameter("@tipo", DB2Type.VarChar) { Value = dto.Tipo });
        }

        if (setParts.Count == 0) return true; // No hay nada que actualizar

        setParts.Add("ULTIMO_CAMBIO = CURRENT TIMESTAMP");

        var sql = $@"
UPDATE {FQN} SET
  {string.Join(", ", setParts)}
WHERE IDOTRITTESPECIALISTA = @id";

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

        var sql = $"DELETE FROM {FQN} WHERE IDOTRITTESPECIALISTA = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        return rows > 0;
    }

    /* --------------------------- HELPERS -------------------------------- */

    private static EspecialistaReadDto MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new EspecialistaReadDto
        {
            IdOtriTtEspecialista = rec.GetInt32(Ord("IDOTRITTESPECIALISTA")),
            Nombres = rec["NOMBRES"] as string,
            Apellidos = rec["APELLIDOS"] as string,
            Identificacion = rec["IDENTIFICACION"] as string,
            Correo = rec["CORREO"] as string,
            Telefono = rec["TELEFONO"] as string,
            Tipo = rec["TIPO"] as string ?? "ADC",
            FechaCreacion = rec["FECHACREACION"] as DateTime?,
            UltimoCambio = rec["ULTIMO_CAMBIO"] as DateTime?
        };
    }
}