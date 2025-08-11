// // ============================================================================
// // File: Infrastructure/Db2/PermisoRepositoryDb2.cs
// // Repositorio DB2 para Permiso usando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class PermisoRepositoryDb2 : IPermisoRepository
// {
//     private readonly string _cs;
//     public PermisoRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     public async Task<IEnumerable<Permiso>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<Permiso>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTPERMISO, IDOTRTTROL, IDOTRTTACCION,
//                    VISUALIZAR, EDITAR, INHABILITAR, CREAR,
//                    CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_PERMISO
//             ORDER BY IDOTRTTPERMISO";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<IEnumerable<Permiso>> GetByRoleAsync(int roleId, CancellationToken ct = default)
//     {
//         var list = new List<Permiso>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTPERMISO, IDOTRTTROL, IDOTRTTACCION,
//                    VISUALIZAR, EDITAR, INHABILITAR, CREAR,
//                    CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_PERMISO
//             WHERE IDOTRTTROL = @r
//             ORDER BY IDOTRTTPERMISO";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@r", roleId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<Permiso?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTPERMISO, IDOTRTTROL, IDOTRTTACCION,
//                    VISUALIZAR, EDITAR, INHABILITAR, CREAR,
//                    CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_PERMISO
//             WHERE IDOTRTTPERMISO = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task<Permiso?> GetByRoleAndAccionAsync(int roleId, int accionId, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTPERMISO, IDOTRTTROL, IDOTRTTACCION,
//                    VISUALIZAR, EDITAR, INHABILITAR, CREAR,
//                    CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_PERMISO
//             WHERE IDOTRTTROL = @r AND IDOTRTTACCION = @a";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@r", roleId));
//         cmd.Parameters.Add(new DB2Parameter("@a", accionId));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     public async Task AddAsync(Permiso e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_PERMISO
//             (IDOTRTTROL, IDOTRTTACCION, VISUALIZAR, EDITAR, INHABILITAR, CREAR, CREATED_AT, UPDATED_AT)
//             VALUES (@r, @a, @v, @e, @i, @c, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@r",  e.RoleId));
//         cmd.Parameters.Add(new DB2Parameter("@a",  e.AccionId));
//         cmd.Parameters.Add(new DB2Parameter("@v",  e.Visualizar));
//         cmd.Parameters.Add(new DB2Parameter("@e",  e.Editar));
//         cmd.Parameters.Add(new DB2Parameter("@i",  e.Inhabilitar));
//         cmd.Parameters.Add(new DB2Parameter("@c",  e.Crear));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//         var newid = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newid;
//     }
//
//     public async Task UpdateAsync(Permiso e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_PERMISO
//             SET IDOTRTTROL=@r, IDOTRTTACCION=@a,
//                 VISUALIZAR=@v, EDITAR=@ed, INHABILITAR=@inh, CREAR=@cr,
//                 UPDATED_AT=@ua
//             WHERE IDOTRTTPERMISO=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@r",  e.RoleId));
//         cmd.Parameters.Add(new DB2Parameter("@a",  e.AccionId));
//         cmd.Parameters.Add(new DB2Parameter("@v",  e.Visualizar));
//         cmd.Parameters.Add(new DB2Parameter("@ed", e.Editar));
//         cmd.Parameters.Add(new DB2Parameter("@inh",e.Inhabilitar));
//         cmd.Parameters.Add(new DB2Parameter("@cr", e.Crear));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_PERMISO WHERE IDOTRTTPERMISO=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     private static Permiso Map(DB2DataReader r) => new()
//     {
//         Id          = Convert.ToInt32(r["IDOTRTTPERMISO"]),
//         RoleId      = Convert.ToInt32(r["IDOTRTTROL"]),
//         AccionId    = Convert.ToInt32(r["IDOTRTTACCION"]),
//         Visualizar  = Convert.ToBoolean(r["VISUALIZAR"]),
//         Editar      = Convert.ToBoolean(r["EDITAR"]),
//         Inhabilitar = Convert.ToBoolean(r["INHABILITAR"]),
//         Crear       = Convert.ToBoolean(r["CREAR"]),
//         CreatedAt   = Convert.ToDateTime(r["CREATED_AT"]),
//         UpdatedAt   = Convert.ToDateTime(r["UPDATED_AT"])
//     };
// }
