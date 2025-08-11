// -----------------------------------------------------------------------------
// File: Api/Controllers/DistribucionesController.cs
// Endpoints REST para manejar distribuciones.  Incluye rutas anidadas
// dentro de resoluciones para coherencia semántica.
// -----------------------------------------------------------------------------
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

/// <summary>
/// Controlador HTTP para gestionar distribuciones económicas asociadas a
/// resoluciones. Expone rutas planas y anidadas bajo <c>/api/resoluciones/{resId}</c>
/// para mantener coherencia semántica con el recurso padre.
/// </summary>
[ApiController]
public class DistribucionesController : ControllerBase
{
    private readonly DistributionResolutionService _svc;

    /// <summary>
    /// Constructor que inyecta el servicio de distribuciones.
    /// </summary>
    /// <param name="svc">Servicio de lógica de negocio para distribuciones.</param>
    public DistribucionesController(DistributionResolutionService svc) => _svc = svc;

    /*---------------- GET /api/distribuciones ---------------------------*/
    /// <summary>
    /// Obtiene todas las distribuciones registradas.
    /// </summary>
    /// <returns>200 OK con la colección de <see cref="DistributionResolution"/>.</returns>
    [HttpGet("api/distribuciones")]
    public async Task<ActionResult<IEnumerable<DistributionResolution>>> GetAll()
        => Ok(await _svc.ListAsync());

    /*------------- GET /api/resoluciones/{resId}/distribuciones ---------*/
    /// <summary>
    /// Lista las distribuciones asociadas a una resolución específica.
    /// </summary>
    /// <param name="resId">Identificador de la resolución.</param>
    /// <returns>200 OK con las distribuciones de la resolución.</returns>
    [HttpGet("api/resoluciones/{resId:int}/distribuciones")]
    public async Task<ActionResult<IEnumerable<DistributionResolution>>> ByResolution(int resId)
        => Ok(await _svc.ListByResolutionAsync(resId));

    /*---------------- GET /api/distribuciones/{id} ----------------------*/
    /// <summary>
    /// Obtiene el detalle de una distribución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la distribución.</param>
    /// <returns>200 OK con la entidad o 404 NotFound si no existe.</returns>
    [HttpGet("api/distribuciones/{id:int}")]
    public async Task<IActionResult> Get(int id)
        => await _svc.GetAsync(id) is { } d ? Ok(d) : NotFound();

    /*------------- POST /api/resoluciones/{resId}/distribuciones --------*/
    /// <summary>
    /// Crea una nueva distribución ligada a la resolución indicada en la ruta.
    /// </summary>
    /// <param name="resId">Identificador de la resolución padre.</param>
    /// <param name="dto">Datos de creación de la distribución.</param>
    /// <returns>
    /// 201 Created con cabecera Location cuando se crea; 
    /// 404 NotFound si la resolución no existe; 
    /// 400 BadRequest si el cuerpo es nulo.
    /// </returns>
    [HttpPost("api/resoluciones/{resId:int}/distribuciones")]
    public async Task<IActionResult> Create(int resId, [FromBody] DistributionCreateDto dto)
    {
        if (dto is null) return BadRequest();
        dto.ResolutionId = resId;

        var id = await _svc.CreateAsync(dto);
        return id is null
            ? NotFound($"La resolución {resId} no existe.")
            : CreatedAtAction(nameof(Get), new { id }, dto);
    }

    /*---------------- PATCH /api/distribuciones/{id} --------------------*/
    /// <summary>
    /// Actualiza parcialmente una distribución existente.
    /// </summary>
    /// <param name="id">Identificador de la distribución.</param>
    /// <param name="dto">Campos a actualizar parcialmente.</param>
    /// <returns>
    /// 204 NoContent si se actualiza; 404 NotFound si no existe; 
    /// 400 BadRequest si el cuerpo es nulo.
    /// </returns>
    [HttpPatch("api/distribuciones/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] DistributionPatchDto dto)
        => dto is null
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
}
