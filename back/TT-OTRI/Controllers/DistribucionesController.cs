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

[ApiController]
public class DistribucionesController : ControllerBase
{
    private readonly DistributionResolutionService _svc;
    public DistribucionesController(DistributionResolutionService svc) => _svc = svc;

    /*---------------- GET /api/distribuciones ---------------------------*/
    [HttpGet("api/distribuciones")]
    public async Task<ActionResult<IEnumerable<DistributionResolution>>> GetAll()
        => Ok(await _svc.ListAsync());

    /*------------- GET /api/resoluciones/{resId}/distribuciones ---------*/
    [HttpGet("api/resoluciones/{resId:int}/distribuciones")]
    public async Task<ActionResult<IEnumerable<DistributionResolution>>> ByResolution(int resId)
        => Ok(await _svc.ListByResolutionAsync(resId));

    /*---------------- GET /api/distribuciones/{id} ----------------------*/
    [HttpGet("api/distribuciones/{id:int}")]
    public async Task<IActionResult> Get(int id)
        => await _svc.GetAsync(id) is { } d ? Ok(d) : NotFound();

    /*------------- POST /api/resoluciones/{resId}/distribuciones --------*/
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
    [HttpPatch("api/distribuciones/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] DistributionPatchDto dto)
        => dto is null
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
}
