// // ============================================================================
// // File: Infrastructure/Db2/ProtectionRepositoryDb2.cs
// // Repositorio DB2 para SOTRI.T_OTRI_TT_PROTECCION utilizando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class ProtectionRepositoryDb2 : IProtectionRepository
// {
//     private readonly string _cs;
//     public ProtectionRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<Protection>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<Protection>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//           SELECT IDOTRTTPROTECCION, IDOTRTTTECNOLOGIA, IDOTRTTTIPOPROTECCION,
//                  FECHA_CONCESION_SOLICITUD, CREATED_AT, UPDATED_AT
//           FROM   SOTRI.T_OTRI_TT_PROTECCION
//           ORDER BY IDOTRTTPROTECCION";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<IEnumerable<Protection>> GetByTechnologyAsync(int technologyId, CancellationToken ct = default)
//     {
//         var list = new List<Protection>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//           SELECT IDOTRTTPROTECCION, IDOTRTTTECNOLOGIA, IDOTRTTTIPOPROTECCION,
//                  FECHA_CONCESION_SOLICITUD, CREATED_AT, UPDATED_AT
//           FROM   SOTRI.T_OTRI_TT_PROTECCION
//           WHERE  IDOTRTTTECNOLOGIA = @t
//           ORDER BY IDOTRTTPROTECCION";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t", technologyId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<Protection?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//           SELECT IDOTRTTPROTECCION, IDOTRTTTECNOLOGIA, IDOTRTTTIPOPROTECCION,
//                  FECHA_CONCESION_SOLICITUD, CREATED_AT, UPDATED_AT
//           FROM   SOTRI.T_OTRI_TT_PROTECCION
//           WHERE  IDOTRTTPROTECCION = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<Protection?> GetByPairAsync(int technologyId, int tipoProteccionId, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//           SELECT IDOTRTTPROTECCION, IDOTRTTTECNOLOGIA, IDOTRTTTIPOPROTECCION,
//                  FECHA_CONCESION_SOLICITUD, CREATED_AT, UPDATED_AT
//           FROM   SOTRI.T_OTRI_TT_PROTECCION
//           WHERE  IDOTRTTTECNOLOGIA = @t AND IDOTRTTTIPOPROTECCION = @p
//           FETCH FIRST 1 ROW ONLY";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t", technologyId));
//         cmd.Parameters.Add(new DB2Parameter("@p", tipoProteccionId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(Protection e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//           INSERT INTO SOTRI.T_OTRI_TT_PROTECCION
//           (IDOTRTTTECNOLOGIA, IDOTRTTTIPOPROTECCION, FECHA_CONCESION_SOLICITUD, CREATED_AT, UPDATED_AT)
//           VALUES (@t, @p, @f, @ca, @ua);
//           SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t",  e.TechnologyId));
//         cmd.Parameters.Add(new DB2Parameter("@p",  e.TipoProteccionId));
//         cmd.Parameters.Add(new DB2Parameter("@f",  (object?)e.FechaConcesionSolicitud ?? DBNull.Value));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(Protection e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//           UPDATE SOTRI.T_OTRI_TT_PROTECCION
//           SET IDOTRTTTECNOLOGIA=@t,
//               IDOTRTTTIPOPROTECCION=@p,
//               FECHA_CONCESION_SOLICITUD=@f,
//               UPDATED_AT=@ua
//           WHERE IDOTRTTPROTECCION=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t",  e.TechnologyId));
//         cmd.Parameters.Add(new DB2Parameter("@p",  e.TipoProteccionId));
//         cmd.Parameters.Add(new DB2Parameter("@f",  (object?)e.FechaConcesionSolicitud ?? DBNull.Value));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@id", e.Id));
//         await cmd.ExecuteNonQueryAsync(ct);
//     }
//
//     public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_PROTECCION WHERE IDOTRTTPROTECCION=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static Protection Map(DB2DataReader r) => new()
//     {
//         Id                     = Convert.ToInt32   (r["IDOTRTTPROTECCION"]),
//         TechnologyId           = Convert.ToInt32   (r["IDOTRTTTECNOLOGIA"]),
//         TipoProteccionId       = Convert.ToInt32   (r["IDOTRTTTIPOPROTECCION"]),
//         FechaConcesionSolicitud= r["FECHA_CONCESION_SOLICITUD"] is DBNull ? null : Convert.ToDateTime(r["FECHA_CONCESION_SOLICITUD"]),
//         CreatedAt              = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt              = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
