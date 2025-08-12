// // ============================================================================
// // File: Infrastructure/Db2/CotitularidadRepositoryDb2.cs
// // Repositorio DB2 para SOTRI.T_OTRI_TT_COTITULARIDAD usando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class CotitularidadRepositoryDb2 : ICotitularidadRepository
// {
//     private readonly string _cs;
//     public CotitularidadRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<Cotitularidad>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<Cotitularidad>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARIDAD, IDOTRTTTECNOLOGIA, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARIDAD
//             ORDER BY IDOTRTTCOTITULARIDAD";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<Cotitularidad?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARIDAD, IDOTRTTTECNOLOGIA, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARIDAD
//             WHERE  IDOTRTTCOTITULARIDAD = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<Cotitularidad?> GetByTechnologyAsync(int technologyId, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARIDAD, IDOTRTTTECNOLOGIA, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARIDAD
//             WHERE  IDOTRTTTECNOLOGIA = @t
//             FETCH FIRST 1 ROW ONLY";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t", technologyId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(Cotitularidad e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_COTITULARIDAD
//             (IDOTRTTTECNOLOGIA, CREATED_AT, UPDATED_AT)
//             VALUES (@t, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t",  e.TechnologyId));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(Cotitularidad e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_COTITULARIDAD
//             SET IDOTRTTTECNOLOGIA=@t, UPDATED_AT=@ua
//             WHERE IDOTRTTCOTITULARIDAD=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@t",  e.TechnologyId));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_COTITULARIDAD WHERE IDOTRTTCOTITULARIDAD=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static Cotitularidad Map(DB2DataReader r) => new()
//     {
//         Id           = Convert.ToInt32   (r["IDOTRTTCOTITULARIDAD"]),
//         TechnologyId = Convert.ToInt32   (r["IDOTRTTTECNOLOGIA"]),
//         CreatedAt    = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt    = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
