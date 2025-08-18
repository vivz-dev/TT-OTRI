// ============================================================================
// Controllers/DistribucionResolucionController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api")]
[Authorize] // Protegido con el JWT de la app (config por defecto en Program.cs)
public sealed class DistribucionResolucionController : ControllerBase
{
    private readonly DistribucionResolucionService _svc;

    public DistribucionResolucionController(DistribucionResolucionService svc)
    {
        _svc = svc;
    }

    /// <summary>Lista las distribuciones de una resolución.</summary>
    [HttpGet("resoluciones/{idResolucion:int}/distribuciones")]
    public async Task<ActionResult<IReadOnlyList<DistribucionResolucionDto>>> GetByResolucion(
        int idResolucion, CancellationToken ct)
    {
        var list = await _svc.GetByResolucionAsync(idResolucion, ct);
        return Ok(list);
    }

    /// <summary>Obtiene una distribución por ID.</summary>
    [HttpGet("distribuciones/{id:int}")]
    public async Task<ActionResult<DistribucionResolucionDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea una distribución para la resolución indicada.</summary>
    [HttpPost("resoluciones/{idResolucion:int}/distribuciones")]
    public async Task<ActionResult> Create(
        int idResolucion,
        [FromBody] CreateDistribucionResolucionDto body,
        CancellationToken ct)
    {
        if (body.IdResolucion.HasValue && body.IdResolucion.Value != idResolucion)
            return BadRequest("El IdResolucion del body no coincide con la ruta.");

        var newId = await _svc.CreateAsync(idResolucion, body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    /// <summary>PATCH parcial de una distribución existente.</summary>
    [HttpPatch("distribuciones/{id:int}")]
    public async Task<ActionResult> Patch(int id,
        [FromBody] PatchDistribucionResolucionDto body,
        CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}
