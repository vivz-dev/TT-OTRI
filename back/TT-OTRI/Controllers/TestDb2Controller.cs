// ============================================================================
// File: Api/Controllers/TestDb2Controller.cs
// Controlador de prueba para validar conectividad y lecturas básicas en DB2.
// Expone endpoints que devuelven hasta 5 filas de tablas de ejemplo.
// No representa el diseño final de la API; es solo para diagnóstico.
// ============================================================================

using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Infrastructure.Db2;

namespace TT_OTRI.Api.Controllers
{
    /// <summary>
    /// Controlador utilitario para pruebas rápidas contra DB2.
    /// Permite verificar cadena de conexión, apertura de conexión y lectura
    /// de resultados a través de <see cref="TestDb2RepositoryDb2"/>.
    /// </summary>
    [ApiController]
    [Route("api/db2-test")]
    public class TestDb2Controller : ControllerBase
    {
        private readonly TestDb2RepositoryDb2 _repo;

        /// <summary>
        /// Constructor. Inyecta el repositorio de prueba para DB2.
        /// </summary>
        /// <param name="repo">Repositorio utilitario para ejecutar lecturas simples.</param>
        public TestDb2Controller(TestDb2RepositoryDb2 repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// GET /api/db2-test/acciones
        /// Ejecuta una consulta simple contra <c>SOTRI.T_OTRI_TT_ACCION</c>
        /// y devuelve hasta 5 filas (primera columna como texto).
        /// </summary>
        /// <returns>Lista de cadenas con los valores de la primera columna.</returns>
        [HttpGet("acciones")]
        public async Task<IActionResult> GetAcciones()
        {
            var data = await _repo.GetAccionesAsync();
            return Ok(data);
        }

        /// <summary>
        /// GET /api/db2-test/roles-permiso
        /// Ejecuta una consulta simple contra <c>SOTRI.T_OTRI_TT_ROL_PERMISO</c>
        /// y devuelve hasta 5 filas (primera columna como texto).
        /// </summary>
        /// <returns>Lista de cadenas con los valores de la primera columna.</returns>
        [HttpGet("roles-permiso")]
        public async Task<IActionResult> GetRolesPermiso()
        {
            var data = await _repo.GetRolesPermisoAsync();
            return Ok(data);
        }
    }
}
