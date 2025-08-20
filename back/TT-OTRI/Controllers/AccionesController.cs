// ============================================================================
// Controllers/AccionesController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/acciones")]
[Authorize] // Protegido por la política por defecto (AppJwtOnly)
public sealed class AccionesController : ControllerBase
{
    private readonly AccionService _svc;

    public AccionesController(AccionService svc) => _svc = svc;

    /// <summary>Lista todas las acciones.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AccionReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    /// <summary>Obtiene una acción por ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AccionReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea una nueva acción.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] AccionCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    /// <summary>PATCH parcial de una acción (solo nombre).</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] AccionPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}
