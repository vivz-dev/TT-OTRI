// // ============================================================================
// // File: Infrastructure/Db2/BeneficiarioInstitucionRepositoryDb2.cs
// // Repositorio DB2 para BeneficiarioInstitucion usando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class BeneficiarioInstitucionRepositoryDb2 : IBeneficiarioInstitucionRepository
// {
//     private readonly string _cs;
//     public BeneficiarioInstitucionRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<BeneficiarioInstitucion>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<BeneficiarioInstitucion>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTBENEFICIARIOINSTITUCION, NOMBRE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_BENEFICIARIOINSTITUCION
//             ORDER BY IDOTRTTBENEFICIARIOINSTITUCION";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<BeneficiarioInstitucion?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTBENEFICIARIOINSTITUCION, NOMBRE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_BENEFICIARIOINSTITUCION
//             WHERE IDOTRTTBENEFICIARIOINSTITUCION = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(BeneficiarioInstitucion e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_BENEFICIARIOINSTITUCION
//             (NOMBRE, CREATED_AT, UPDATED_AT)
//             VALUES (@n, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@n",  e.Nombre));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(BeneficiarioInstitucion e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_BENEFICIARIOINSTITUCION
//             SET NOMBRE=@n, UPDATED_AT=@ua
//             WHERE IDOTRTTBENEFICIARIOINSTITUCION=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@n",  e.Nombre));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_BENEFICIARIOINSTITUCION
//                              WHERE IDOTRTTBENEFICIARIOINSTITUCION=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static BeneficiarioInstitucion Map(DB2DataReader r) => new()
//     {
//         Id        = Convert.ToInt32   (r["IDOTRTTBENEFICIARIOINSTITUCION"]),
//         Nombre    = r["NOMBRE"]?.ToString() ?? "",
//         CreatedAt = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
