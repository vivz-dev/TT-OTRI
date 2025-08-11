// // ============================================================================
// // File: Infrastructure/Db2/UserRoleRepositoryDb2.cs
// // Repositorio DB2 para Usuario–Rol.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class UserRoleRepositoryDb2 : IUserRoleRepository
// {
//     private readonly string _cs;
//     public UserRoleRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<UserRole>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<UserRole>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTUSUARIOROL, IDUSUARIO, IDOTRTTROL, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_USUARIO_ROL
//             ORDER BY IDOTRTTUSUARIOROL";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<IEnumerable<UserRole>> GetByUserAsync(int usuarioId, CancellationToken ct = default)
//     {
//         var list = new List<UserRole>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTUSUARIOROL, IDUSUARIO, IDOTRTTROL, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_USUARIO_ROL
//             WHERE IDUSUARIO = @u
//             ORDER BY IDOTRTTUSUARIOROL";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@u", usuarioId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<UserRole?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTUSUARIOROL, IDUSUARIO, IDOTRTTROL, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_USUARIO_ROL
//             WHERE IDOTRTTUSUARIOROL = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<UserRole?> GetByUserAndRoleAsync(int usuarioId, int roleId, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTUSUARIOROL, IDUSUARIO, IDOTRTTROL, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_USUARIO_ROL
//             WHERE IDUSUARIO = @u AND IDOTRTTROL = @r";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@u", usuarioId));
//         cmd.Parameters.Add(new DB2Parameter("@r", roleId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(UserRole e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_USUARIO_ROL
//             (IDUSUARIO, IDOTRTTROL, CREATED_AT, UPDATED_AT)
//             VALUES (@u, @r, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@u",  e.UsuarioId));
//         cmd.Parameters.Add(new DB2Parameter("@r",  e.RoleId));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//         var newid = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newid;
//     }
//
//     public async Task UpdateAsync(UserRole e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_USUARIO_ROL
//             SET IDUSUARIO=@u, IDOTRTTROL=@r, UPDATED_AT=@ua
//             WHERE IDOTRTTUSUARIOROL=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@u",  e.UsuarioId));
//         cmd.Parameters.Add(new DB2Parameter("@r",  e.RoleId));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_USUARIO_ROL WHERE IDOTRTTUSUARIOROL=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static UserRole Map(DB2DataReader r) => new()
//     {
//         Id        = Convert.ToInt32(r["IDOTRTTUSUARIOROL"]),
//         UsuarioId = Convert.ToInt32(r["IDUSUARIO"]),
//         RoleId    = Convert.ToInt32(r["IDOTRTTROL"]),
//         CreatedAt = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
