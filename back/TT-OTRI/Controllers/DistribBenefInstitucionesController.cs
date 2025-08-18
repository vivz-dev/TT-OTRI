// ============================================================================
// Controllers/DistribBenefInstitucionesController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/distrib-benef-instituciones")]
[Authorize] // 🔒 Protegido con el App JWT (esquema por defecto configurado en Program.cs)
public sealed class DistribBenefInstitucionesController : ControllerBase
{
    private readonly DistribBenefInstitucionService _svc;

    public DistribBenefInstitucionesController(DistribBenefInstitucionService svc)
        => _svc = svc;

    /// <summary>Lista todos los registros.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DistribBenefInstitucionReadDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<DistribBenefInstitucionReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    /// <summary>Obtiene un registro por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DistribBenefInstitucionReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DistribBenefInstitucionReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea un registro.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] DistribBenefInstitucionCreateDto dto, CancellationToken ct)
    {
        var id = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Modifica parcialmente (PATCH) un registro.</summary>
    [HttpPatch("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Patch(int id, [FromBody] DistribBenefInstitucionPatchDto dto, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, dto, ct);
        return ok ? NoContent() : NotFound();
    }

    /// <summary>Elimina un registro.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _svc.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
