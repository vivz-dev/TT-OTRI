// ============================================================================
// File: Infrastructure/Db2/TestDb2Repository.cs
// Repositorio de prueba para verificar conectividad y lectura básica en DB2.
// Ejecuta consultas simples (FETCH FIRST 5 ROWS ONLY) sobre tablas de ejemplo
// para validar cadena de conexión, apertura de conexión y lectura de filas.
// ============================================================================

using IBM.Data.Db2;
using Microsoft.Extensions.Configuration;

namespace TT_OTRI.Infrastructure.Db2
{
    /// <summary>
    /// Repositorio utilitario para pruebas rápidas contra DB2.
    /// No representa el diseño final de acceso a datos; su objetivo es
    /// comprobar conectividad, permisos y la lectura básica de resultados.
    /// </summary>
    public class TestDb2Repository
    {
        private readonly string _connString;

        /// <summary>
        /// Constructor: obtiene la cadena de conexión "Db2" desde la configuración.
        /// Lanza una excepción si no se encuentra la clave ConnectionStrings:Db2.
        /// </summary>
        public TestDb2Repository(IConfiguration cfg)
        {
            _connString = cfg.GetConnectionString("Db2")
                          ?? throw new InvalidOperationException("ConnectionStrings:Db2 no configurada.");
        }

        /// <summary>
        /// Lee hasta 5 filas de la tabla SOTRI.T_OTRI_TT_ACCION y devuelve
        /// el valor de la primera columna como texto por cada fila.
        /// Útil para validar acceso y formato básico de lectura.
        /// </summary>
        public async Task<List<string>> GetAccionesAsync()
        {
            var list = new List<string>();

            await using var conn = new DB2Connection(_connString);
            await conn.OpenAsync();

            // Ajusta columnas según tu tabla real
            const string sql = @"SELECT * FROM SOTRI.T_OTRI_TT_ACCION FETCH FIRST 5 ROWS ONLY";

            await using var cmd = new DB2Command(sql, conn);
            await using var rdr = await cmd.ExecuteReaderAsync();

            while (await rdr.ReadAsync())
            {
                list.Add(rdr[0].ToString() ?? "NULL"); // primera columna como texto
            }

            return list;
        }

        /// <summary>
        /// Lee hasta 5 filas de la tabla SOTRI.T_OTRI_TT_ROL_PERMISO y devuelve
        /// el valor de la primera columna como texto por cada fila.
        /// Útil para validar acceso y lectura sobre otra tabla de referencia.
        /// </summary>
        public async Task<List<string>> GetRolesPermisoAsync()
        {
            var list = new List<string>();

            await using var conn = new DB2Connection(_connString);
            await conn.OpenAsync();

            const string sql = @"SELECT * FROM SOTRI.T_OTRI_TT_ROL_PERMISO FETCH FIRST 5 ROWS ONLY";

            await using var cmd = new DB2Command(sql, conn);
            await using var rdr = await cmd.ExecuteReaderAsync();

            while (await rdr.ReadAsync())
            {
                list.Add(rdr[0].ToString() ?? "NULL");
            }

            return list;
        }
    }
}
