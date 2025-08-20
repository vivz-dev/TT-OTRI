// ============================================================================
// Controllers/CesionController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/cesiones")]
[Authorize] // Protegido con el JWT de la app (config por defecto en Program.cs)
public sealed class CesionController : ControllerBase
{
    private readonly CesionService _svc;

    public CesionController(CesionService svc)
    {
        _svc = svc;
    }

    /// <summary>Lista todas las cesiones.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CesionReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    /// <summary>Obtiene una cesión por ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CesionReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea una nueva cesión.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CesionCreateDto body, CancellationToken ct)
    {
        try
        {
            var newId = await _svc.CreateAsync(body, ct);
            return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>PATCH parcial de una cesión existente.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] CesionPatchDto body, CancellationToken ct)
    {
        try
        {
            var ok = await _svc.PatchAsync(id, body, ct);
            return ok ? NoContent() : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}