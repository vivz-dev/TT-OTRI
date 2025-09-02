// Infrastructure/Repositories/ProteccionRepositoryDb2.cs
using System.Data;
using System.Data.Common;
using IBM.Data.Db2;
using TT_OTRI.Domain;
using TT_OTRI.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Repositories;

public sealed class ProteccionRepositoryDb2 : IProteccionRepository
{
    private readonly string _connString;
    private readonly string _schema;
    private const string TableName = "T_OTRI_TT_PROTECCION";
    private string FQN => $"{_schema}.{TableName}";

    public ProteccionRepositoryDb2(IConfiguration cfg)
    {
        _connString = "Server=192.168.254.53:50000;Database=SAAC;UserID=USROTRI;Password=wL8QUtS9FbprI;";
        _schema = "SOTRI";
    }

    public async Task<IEnumerable<Proteccion>> GetAllAsync(CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTPROTECCION,
  IDOTRITTTECNOLOGIA,
  IDOTRITTTIPOPROTECCION,
  FECHASOLICITUD,
  CONCESION,
  SOLICITUD,
  FECHACONCESION,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
ORDER BY IDOTRITTPROTECCION DESC";

        using var cmd = new DB2Command(sql, conn);
        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);

        var list = new List<Proteccion>();
        while (await rdr.ReadAsync(ct))
            list.Add(MapFromRecord(rdr));
        return list;
    }

    public async Task<Proteccion?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
SELECT
  IDOTRITTPROTECCION,
  IDOTRITTTECNOLOGIA,
  IDOTRITTTIPOPROTECCION,
  FECHASOLICITUD,
  CONCESION,
  SOLICITUD,
  FECHACONCESION,
  FECHACREACION,
  ULTIMO_CAMBIO
FROM {FQN}
WHERE IDOTRITTPROTECCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = id });

        await using var rdr = (DbDataReader)await cmd.ExecuteReaderAsync(ct);
        return await rdr.ReadAsync(ct) ? MapFromRecord(rdr) : null;
    }

    public async Task<int> AddAsync(Proteccion p, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        try
        {
            var insert = $@"
INSERT INTO {FQN}
( IDOTRITTTECNOLOGIA,
  IDOTRITTTIPOPROTECCION,
  FECHASOLICITUD,
  CONCESION,
  SOLICITUD,
  FECHACONCESION )
VALUES
( @idTecnologia,
  @idTipoProteccion,
  @fechaSolicitud,
  @concesion,
  @solicitud,
  @fechaConcesion )";

            using (var cmd = new DB2Command(insert, conn))
            {
                cmd.Transaction = (DB2Transaction)tx;
                cmd.Parameters.Add(new DB2Parameter("@idTecnologia", DB2Type.Integer)   { Value = p.IdTecnologia });
                cmd.Parameters.Add(new DB2Parameter("@idTipoProteccion", DB2Type.SmallInt) { Value = p.IdTipoProteccion });
                cmd.Parameters.Add(new DB2Parameter("@fechaSolicitud", DB2Type.Date)
                {
                    Value = p.FechaSolicitud.HasValue ? p.FechaSolicitud.Value.Date : DBNull.Value
                });
                cmd.Parameters.Add(new DB2Parameter("@concesion", DB2Type.SmallInt) { Value = p.Concesion });
                cmd.Parameters.Add(new DB2Parameter("@solicitud", DB2Type.SmallInt) { Value = p.Solicitud });
                cmd.Parameters.Add(new DB2Parameter("@fechaConcesion", DB2Type.Date)
                {
                    Value = p.FechaConcesion.HasValue ? p.FechaConcesion.Value.Date : DBNull.Value
                });

                await cmd.ExecuteNonQueryAsync(ct);
            }

            using (var idCmd = new DB2Command("SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1", conn))
            {
                idCmd.Transaction = (DB2Transaction)tx;
                var obj = await idCmd.ExecuteScalarAsync(ct);
                p.Id = Convert.ToInt32(obj);
            }

            await tx.CommitAsync(ct);

            var back = await GetByIdAsync(p.Id, ct);
            if (back != null)
            {
                p.CreatedAt = back.CreatedAt;
                p.UpdatedAt = back.UpdatedAt;
            }
            else
            {
                p.CreatedAt = p.UpdatedAt = DateTime.UtcNow;
            }

            return p.Id;
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateAsync(Proteccion p, CancellationToken ct = default)
    {
        using var conn = new DB2Connection(_connString);
        await conn.OpenAsync(ct);

        var sql = $@"
UPDATE {FQN} SET
  IDOTRITTTECNOLOGIA    = @idTecnologia,
  IDOTRITTTIPOPROTECCION= @idTipoProteccion,
  FECHASOLICITUD        = @fechaSolicitud,
  CONCESION             = @concesion,
  SOLICITUD             = @solicitud,
  FECHACONCESION        = @fechaConcesion,
  ULTIMO_CAMBIO         = CURRENT TIMESTAMP
WHERE IDOTRITTPROTECCION = @id";

        using var cmd = new DB2Command(sql, conn);
        cmd.Parameters.Add(new DB2Parameter("@idTecnologia", DB2Type.Integer)   { Value = p.IdTecnologia });
        cmd.Parameters.Add(new DB2Parameter("@idTipoProteccion", DB2Type.SmallInt) { Value = p.IdTipoProteccion });
        cmd.Parameters.Add(new DB2Parameter("@fechaSolicitud", DB2Type.Date)
        {
            Value = p.FechaSolicitud.HasValue ? p.FechaSolicitud.Value.Date : DBNull.Value
        });
        cmd.Parameters.Add(new DB2Parameter("@concesion", DB2Type.SmallInt) { Value = p.Concesion });
        cmd.Parameters.Add(new DB2Parameter("@solicitud", DB2Type.SmallInt) { Value = p.Solicitud });
        cmd.Parameters.Add(new DB2Parameter("@fechaConcesion", DB2Type.Date)
        {
            Value = p.FechaConcesion.HasValue ? p.FechaConcesion.Value.Date : DBNull.Value
        });
        cmd.Parameters.Add(new DB2Parameter("@id", DB2Type.Integer) { Value = p.Id });

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0) throw new KeyNotFoundException($"Proteccion {p.Id} no existe.");

        var back = await GetByIdAsync(p.Id, ct);
        if (back != null) p.UpdatedAt = back.UpdatedAt;
    }

    private static DateTime? GetNullableDate(IDataRecord rec, string col)
    {
        var idx = rec.GetOrdinal(col);
        if (rec.IsDBNull(idx)) return null;
        return Convert.ToDateTime(rec.GetValue(idx));
    }

    private static Proteccion MapFromRecord(IDataRecord rec)
    {
        int Ord(string name) => rec.GetOrdinal(name);

        return new Proteccion
        {
            Id              = rec.GetInt32(Ord("IDOTRITTPROTECCION")),
            IdTecnologia    = rec.GetInt32(Ord("IDOTRITTTECNOLOGIA")),
            IdTipoProteccion= rec.GetInt16(Ord("IDOTRITTTIPOPROTECCION")),
            FechaSolicitud  = GetNullableDate(rec, "FECHASOLICITUD"),
            Concesion       = rec.GetInt16(Ord("CONCESION")),
            Solicitud       = rec.GetInt16(Ord("SOLICITUD")),
            FechaConcesion  = GetNullableDate(rec, "FECHACONCESION"),
            CreatedAt       = Convert.ToDateTime(rec["FECHACREACION"]),
            UpdatedAt       = Convert.ToDateTime(rec["ULTIMO_CAMBIO"])
        };
    }
}
