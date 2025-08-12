// // ============================================================================
// // File: Infrastructure/Db2/TechnologyRepositoryDb2.cs
// // Repositorio DB2 para tecnologías usando IBM.Data.Db2.
// // ============================================================================
// using IBM.Data.Db2;
// using Microsoft.Extensions.Configuration;
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.Db2;
//
// public class TechnologyRepositoryDb2 : ITechnologyRepository
// {
//     private readonly string _cs;
//     public TechnologyRepositoryDb2(IConfiguration cfg)
//         => _cs = cfg.GetConnectionString("Db2")
//            ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
//
//     /*------------------- Lectura -------------------*/
//     public async Task<IEnumerable<Technology>> GetAllAsync(CancellationToken ct = default)
//     {
//         var list = new List<Technology>();
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTTECNOLOGIA, IDUSUARIO, TITULO, DESCRIPCION, ESTADO,
//                    COMPLETED, COTITULARIDAD, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_TECNOLOGIA
//             ORDER BY IDOTRTTTECNOLOGIA";
//
//         await using var cmd = new DB2Command(sql, conn);
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         while (await rdr.ReadAsync(ct)) list.Add(Map(rdr));
//         return list;
//     }
//
//     public async Task<Technology?> GetByIdAsync(int id, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             SELECT IDOTRTTTECNOLOGIA, IDUSUARIO, TITULO, DESCRIPCION, ESTADO,
//                    COMPLETED, COTITULARIDAD, CREATED_AT, UPDATED_AT
//             FROM SOTRI.T_OTRI_TT_TECNOLOGIA
//             WHERE IDOTRTTTECNOLOGIA = @id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         await using var rdr = await cmd.ExecuteReaderAsync(ct);
//         return await rdr.ReadAsync(ct) ? Map(rdr) : null;
//     }
//
//     /*------------------- Escritura -----------------*/
//     public async Task AddAsync(Technology e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             INSERT INTO SOTRI.T_OTRI_TT_TECNOLOGIA
//             (IDUSUARIO, TITULO, DESCRIPCION, ESTADO,
//              COMPLETED, COTITULARIDAD, CREATED_AT, UPDATED_AT)
//             VALUES
//             (@u, @t, @d, @es, @c, @co, @ca, @ua);
//             SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@u",  e.IdUsuario));
//         cmd.Parameters.Add(new DB2Parameter("@t",  e.Titulo));
//         cmd.Parameters.Add(new DB2Parameter("@d",  e.Descripcion));
//         cmd.Parameters.Add(new DB2Parameter("@es", (char)e.Estado));          // CHAR(1)
//         cmd.Parameters.Add(new DB2Parameter("@c",  e.Completed));
//         cmd.Parameters.Add(new DB2Parameter("@co", e.Cotitularidad));
//         cmd.Parameters.Add(new DB2Parameter("@ca", e.CreatedAt));
//         cmd.Parameters.Add(new DB2Parameter("@ua", e.UpdatedAt));
//
//         var newId = (decimal)await cmd.ExecuteScalarAsync(ct);
//         e.Id = (int)newId;
//     }
//
//     public async Task UpdateAsync(Technology e, CancellationToken ct = default)
//     {
//         await using var conn = new DB2Connection(_cs);
//         await conn.OpenAsync(ct);
//
//         const string sql = @"
//             UPDATE SOTRI.T_OTRI_TT_TECNOLOGIA
//             SET IDUSUARIO=@u, TITULO=@t, DESCRIPCION=@d, ESTADO=@es,
//                 COMPLETED=@c, COTITULARIDAD=@co, UPDATED_AT=@ua
//             WHERE IDOTRTTTECNOLOGIA=@id";
//
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@u",  e.IdUsuario));
//         cmd.Parameters.Add(new DB2Parameter("@t",  e.Titulo));
//         cmd.Parameters.Add(new DB2Parameter("@d",  e.Descripcion));
//         cmd.Parameters.Add(new DB2Parameter("@es", (char)e.Estado));
//         cmd.Parameters.Add(new DB2Parameter("@c",  e.Completed));
//         cmd.Parameters.Add(new DB2Parameter("@co", e.Cotitularidad));
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
//         const string sql = @"DELETE FROM SOTRI.T_OTRI_TT_TECNOLOGIA WHERE IDOTRTTTECNOLOGIA=@id";
//         await using var cmd = new DB2Command(sql, conn);
//         cmd.Parameters.Add(new DB2Parameter("@id", id));
//         var rows = await cmd.ExecuteNonQueryAsync(ct);
//         return rows > 0;
//     }
//
//     /*------------------- Mapeo ---------------------*/
//     private static Technology Map(DB2DataReader r) => new()
//     {
//         Id            = Convert.ToInt32   (r["IDOTRTTTECNOLOGIA"]),
//         IdUsuario     = Convert.ToInt32   (r["IDUSUARIO"]),
//         Titulo        = r["TITULO"]?.ToString() ?? "",
//         Descripcion   = r["DESCRIPCION"]?.ToString() ?? "",
//         Estado        = ToStatus           (r["ESTADO"]),
//         Completed     = Convert.ToBoolean  (r["COMPLETED"]),
//         Cotitularidad = Convert.ToBoolean  (r["COTITULARIDAD"]),
//         CreatedAt     = Convert.ToDateTime (r["CREATED_AT"]),
//         UpdatedAt     = Convert.ToDateTime (r["UPDATED_AT"])
//     };
//
//     private static TechnologyStatus ToStatus(object dbVal)
//     {
//         var s = dbVal?.ToString();
//         var ch = string.IsNullOrEmpty(s) ? 'D' : s[0];
//         return (TechnologyStatus)ch;
//     }
// }
