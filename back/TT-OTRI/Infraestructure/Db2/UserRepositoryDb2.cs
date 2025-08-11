// // ============================================================================
// // File: Infrastructure/Db2/UserRepositoryDb2.cs
// // Repositorio DB2 mínimo para User (FK).
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class UserRepositoryDb2 : IUserRepository
// {
//     private readonly string _cs;
//     public UserRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//                  ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDUSUARIO, NOMBRE, EMAIL, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_USUARIO
//             WHERE IDUSUARIO = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         if (!await rdr.ReadAsync(ct)) return null;
//
//         return new User
//         {
//             Id        = Convert.ToInt32(rdr["IDUSUARIO"]),
//             Nombre    = rdr["NOMBRE"]?.ToString() ?? "",
//             Email     = rdr["EMAIL"]?.ToString() ?? "",
//             CreatedAt = Convert.ToDateTime(rdr["CREATED_AT"]),
//             UpdatedAt = Convert.ToDateTime(rdr["UPDATED_AT"])
//         };
//     }
// }