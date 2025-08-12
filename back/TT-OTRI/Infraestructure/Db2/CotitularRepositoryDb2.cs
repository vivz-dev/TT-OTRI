// // ============================================================================
// // File: Infrastructure/Db2/CotitularRepositoryDb2.cs
// // Repositorio DB2 para SOTRI.T_OTRI_TT_COTITULAR usando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class CotitularRepositoryDb2 : ICotitularRepository
// {
//     private readonly string _cs;
//     public CotitularRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<Cotitular>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<Cotitular>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULAR, IDOTRTTCOTITULARIDAD, IDOTRTTCOTITULARINSTIT,
//                    IDUSUARIO, PORCCOTITULARIDAD, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULAR
//             ORDER BY IDOTRTTCOTITULAR";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<Cotitular?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULAR, IDOTRTTCOTITULARIDAD, IDOTRTTCOTITULARINSTIT,
//                    IDUSUARIO, PORCCOTITULARIDAD, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULAR
//             WHERE  IDOTRTTCOTITULAR = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<IEnumerable<Cotitular>> GetByCotitularidadAsync(int cotitularidadId, CancellationToken ct = default)
//     {
//         var list = new List<Cotitular>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULAR, IDOTRTTCOTITULARIDAD, IDOTRTTCOTITULARINSTIT,
//                    IDUSUARIO, PORCCOTITULARIDAD, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULAR
//             WHERE  IDOTRTTCOTITULARIDAD = @c
//             ORDER BY IDOTRTTCOTITULAR";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@c", cotitularidadId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<Cotitular?> GetByPairAsync(int cotitularidadId, int cotitularInstitId, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULAR, IDOTRTTCOTITULARIDAD, IDOTRTTCOTITULARINSTIT,
//                    IDUSUARIO, PORCCOTITULARIDAD, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULAR
//             WHERE  IDOTRTTCOTITULARIDAD = @c
//               AND  IDOTRTTCOTITULARINSTIT = @i
//             FETCH FIRST 1 ROW ONLY";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@c", cotitularidadId));
//         cmd.Parameters.Add(new DB2Parameter("@i", cotitularInstitId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(Cotitular e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_COTITULAR
//             (IDOTRTTCOTITULARIDAD, IDOTRTTCOTITULARINSTIT, IDUSUARIO,
//              PORCCOTITULARIDAD, CREATED_AT, UPDATED_AT)
//             VALUES (@c, @i, @u, @p, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@c",  e.CotitularidadId));
//         cmd.Parameters.Add(new DB2Parameter("@i",  e.CotitularInstitId));
//         cmd.Parameters.Add(new DB2Parameter("@u",  e.IdUsuario));
//         cmd.Parameters.Add(new DB2Parameter("@p",  e.PorcCotitularidad));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(Cotitular e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_COTITULAR
//             SET IDOTRTTCOTITULARIDAD=@c,
//                 IDOTRTTCOTITULARINSTIT=@i,
//                 IDUSUARIO=@u,
//                 PORCCOTITULARIDAD=@p,
//                 UPDATED_AT=@ua
//             WHERE IDOTRTTCOTITULAR=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@c",  e.CotitularidadId));
//         cmd.Parameters.Add(new DB2Parameter("@i",  e.CotitularInstitId));
//         cmd.Parameters.Add(new DB2Parameter("@u",  e.IdUsuario));
//         cmd.Parameters.Add(new DB2Parameter("@p",  e.PorcCotitularidad));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_COTITULAR WHERE IDOTRTTCOTITULAR=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static Cotitular Map(DB2DataReader r) => new()
//     {
//         Id                 = Convert.ToInt32   (r["IDOTRTTCOTITULAR"]),
//         CotitularidadId    = Convert.ToInt32   (r["IDOTRTTCOTITULARIDAD"]),
//         CotitularInstitId  = Convert.ToInt32   (r["IDOTRTTCOTITULARINSTIT"]),
//         IdUsuario          = Convert.ToInt32   (r["IDUSUARIO"]),
//         PorcCotitularidad  = r["PORCCOTITULARIDAD"] is DBNull ? 0m : Convert.ToDecimal(r["PORCCOTITULARIDAD"]),
//         CreatedAt          = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt          = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
