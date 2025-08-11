// // ============================================================================
// // File: Infrastructure/Db2/RoleRepositoryDb2.cs
// // Repositorio DB2 para Roles usando IBM.Data.Db2.
// // (Descomenta su registro en DependencyInjection cuando lo uses.)
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// /// <summary>
// /// Repositorio DB2 para Roles.
// /// </summary>
// public class RoleRepositoryDb2 : IRoleRepository
// {
//     private readonly string _cs;
//     /// <summary>Constructor: obtiene ConnectionString("Db2").</summary>
//     public RoleRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//             ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     /// <summary>Devuelve todos los roles.</summary>
//     public async Task<IEnumerable<Role>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<Role>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTROL, NOMBRE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_ROL
//             ORDER BY IDOTRTTROL";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     /// <summary>Devuelve un rol por Id.</summary>
//     public async Task<Role?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTROL, NOMBRE, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_ROL
//             WHERE IDOTRTTROL = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     /// <summary>Inserta un rol y asigna Id.</summary>
//     public async Task AddAsync(Role e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_ROL (NOMBRE, CREATED_AT, UPDATED_AT)
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
//     /// <summary>Actualiza un rol existente.</summary>
//     public async Task UpdateAsync(Role e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_ROL
//             SET NOMBRE=@n, UPDATED_AT=@ua
//             WHERE IDOTRTTROL=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@n",  e.Nombre));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@id", e.Id));
//         await cmd.ExecuteNonQueryAsync(ct);
//     }
//
//     /// <summary>Elimina un rol por Id.</summary>
//     public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_ROL WHERE IDOTRTTROL=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static Role Map(DB2DataReader r) => new()
//     {
//         Id        = Convert.ToInt32(r["IDOTRTTROL"]),
//         Nombre    = r["NOMBRE"]?.ToString() ?? "",
//         CreatedAt = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt = Convert.ToDateTime(r["UPDATED_AT"]),
//     };
// }
