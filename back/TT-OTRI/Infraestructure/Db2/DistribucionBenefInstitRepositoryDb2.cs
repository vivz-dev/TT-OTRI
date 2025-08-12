// // ============================================================================
// // File: Infrastructure/Db2/DistribucionBenefInstitRepositoryDb2.cs
// // Repositorio DB2 para SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class DistribucionBenefInst itRepositoryDb2 : IDistribucionBenefInstitRepository
// {
//     private readonly string _cs;
//     public DistribucionBenefInstitRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<DistribucionBenefInstit>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<DistribucionBenefInstit>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTDISTRIBUCIONBENEFINSTIT,
//                    IDOTRTTDISTRIBUCIONRESOLUCION,
//                    IDOTRTTBENEFICIARIOINSTITUCION,
//                    PORCENTAJE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT
//             ORDER BY IDOTRTTDISTRIBUCIONBENEFINSTIT";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<IEnumerable<DistribucionBenefInstit>> GetByDistribucionAsync(int distribucionId, CancellationToken ct = default)
//     {
//         var list = new List<DistribucionBenefInstit>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTDISTRIBUCIONBENEFINSTIT,
//                    IDOTRTTDISTRIBUCIONRESOLUCION,
//                    IDOTRTTBENEFICIARIOINSTITUCION,
//                    PORCENTAJE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT
//             WHERE IDOTRTTDISTRIBUCIONRESOLUCION = @d
//             ORDER BY IDOTRTTDISTRIBUCIONBENEFINSTIT";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@d", distribucionId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<DistribucionBenefInstit?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTDISTRIBUCIONBENEFINSTIT,
//                    IDOTRTTDISTRIBUCIONRESOLUCION,
//                    IDOTRTTBENEFICIARIOINSTITUCION,
//                    PORCENTAJE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT
//             WHERE IDOTRTTDISTRIBUCIONBENEFINSTIT = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<DistribucionBenefInstit?> GetByPairAsync(int distribucionId, int beneficiarioId, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTDISTRIBUCIONBENEFINSTIT,
//                    IDOTRTTDISTRIBUCIONRESOLUCION,
//                    IDOTRTTBENEFICIARIOINSTITUCION,
//                    PORCENTAJE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT
//             WHERE IDOTRTTDISTRIBUCIONRESOLUCION = @d
//               AND IDOTRTTBENEFICIARIOINSTITUCION = @b";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@d", distribucionId));
//         cmd.Parameters.Add(new DB2Parameter("@b", beneficiarioId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(DistribucionBenefInstit e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT
//             (IDOTRTTDISTRIBUCIONRESOLUCION, IDOTRTTBENEFICIARIOINSTITUCION,
//              PORCENTAJE, CREATED_AT, UPDATED_AT)
//             VALUES (@d, @b, @p, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@d",  e.DistribucionResolucionId));
//         cmd.Parameters.Add(new DB2Parameter("@b",  e.BeneficiarioInstitucionId));
//         cmd.Parameters.Add(new DB2Parameter("@p",  e.Porcentaje));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(DistribucionBenefInstit e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT
//             SET IDOTRTTDISTRIBUCIONRESOLUCION=@d,
//                 IDOTRTTBENEFICIARIOINSTITUCION=@b,
//                 PORCENTAJE=@p,
//                 UPDATED_AT=@ua
//             WHERE IDOTRTTDISTRIBUCIONBENEFINSTIT=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@d",  e.DistribucionResolucionId));
//         cmd.Parameters.Add(new DB2Parameter("@b",  e.BeneficiarioInstitucionId));
//         cmd.Parameters.Add(new DB2Parameter("@p",  e.Porcentaje));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT WHERE IDOTRTTDISTRIBUCIONBENEFINSTIT=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static DistribucionBenefInstit Map(DB2DataReader r) => new()
//     {
//         Id                        = Convert.ToInt32   (r["IDOTRTTDISTRIBUCIONBENEFINSTIT"]),
//         DistribucionResolucionId  = Convert.ToInt32   (r["IDOTRTTDISTRIBUCIONRESOLUCION"]),
//         BeneficiarioInstitucionId = Convert.ToInt32   (r["IDOTRTTBENEFICIARIOINSTITUCION"]),
//         Porcentaje                = Convert.ToDecimal (r["PORCENTAJE"]),
//         CreatedAt                 = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt                 = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
