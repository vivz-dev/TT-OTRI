// // ============================================================================
// // File: Infrastructure/Db2/CotitularidadInstRepositoryDb2.cs
// // Repositorio DB2 para SOTRI.T_OTRI_TT_COTITULARINSTIT usando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class CotitularInstitRepositoryDb2 : ICotitularInstitRepository
// {
//     private readonly string _cs;
//     public CotitularInstitRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<CotitularInstit>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<CotitularInstit>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARINSTIT, NOMBRE, CORREO, RUC, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARINSTIT
//             ORDER BY IDOTRTTCOTITULARINSTIT";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<CotitularInstit?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARINSTIT, NOMBRE, CORREO, RUC, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARINSTIT
//             WHERE  IDOTRTTCOTITULARINSTIT = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<CotitularInstit?> GetByRucAsync(string ruc, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARINSTIT, NOMBRE, CORREO, RUC, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARINSTIT
//             WHERE  UPPER(RUC) = UPPER(@r)
//             FETCH FIRST 1 ROW ONLY";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@r", ruc));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<CotitularInstit?> GetByCorreoAsync(string correo, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTCOTITULARINSTIT, NOMBRE, CORREO, RUC, CREATED_AT, UPDATED_AT
//             FROM   SOTRI.T_OTRI_TT_COTITULARINSTIT
//             WHERE  UPPER(CORREO) = UPPER(@c)
//             FETCH FIRST 1 ROW ONLY";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@c", correo));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(CotitularInstit e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_COTITULARINSTIT
//             (NOMBRE, CORREO, RUC, CREATED_AT, UPDATED_AT)
//             VALUES (@n, @c, @r, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@n",  e.Nombre));
//         cmd.Parameters.Add(new DB2Parameter("@c",  string.IsNullOrEmpty(e.Correo) ? DBNull.Value : e.Correo));
//         cmd.Parameters.Add(new DB2Parameter("@r",  string.IsNullOrEmpty(e.Ruc)    ? DBNull.Value : e.Ruc));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(CotitularInstit e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_COTITULARINSTIT
//             SET NOMBRE=@n, CORREO=@c, RUC=@r, UPDATED_AT=@ua
//             WHERE IDOTRTTCOTITULARINSTIT=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@n",  e.Nombre));
//         cmd.Parameters.Add(new DB2Parameter("@c",  string.IsNullOrEmpty(e.Correo) ? DBNull.Value : e.Correo));
//         cmd.Parameters.Add(new DB2Parameter("@r",  string.IsNullOrEmpty(e.Ruc)    ? DBNull.Value : e.Ruc));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_COTITULARINSTIT WHERE IDOTRTTCOTITULARINSTIT=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static CotitularInstit Map(DB2DataReader r) => new()
//     {
//         Id        = Convert.ToInt32   (r["IDOTRTTCOTITULARINSTIT"]),
//         Nombre    = r["NOMBRE"]?.ToString() ?? "",
//         Correo    = r["CORREO"] is DBNull ? "" : r["CORREO"]!.ToString()!,
//         Ruc       = r["RUC"]    is DBNull ? "" : r["RUC"]!.ToString()!,
//         CreatedAt = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
