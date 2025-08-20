// ============================================================================
// Controllers/AutorController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/autores")]
[Authorize] // Protegido con el JWT de la app (config por defecto en Program.cs)
public sealed class AutorController : ControllerBase
{
    private readonly AutorService _svc;

    public AutorController(AutorService svc)
    {
        _svc = svc;
    }

    /// <summary>Obtiene todos los autores.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AutorReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    /// <summary>Obtiene un autor por su ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AutorReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Obtiene autores por ID de acuerdo de distribución.</summary>
    [HttpGet("por-acuerdo/{idAcuerdoDistrib:int}")]
    public async Task<ActionResult<IReadOnlyList<AutorReadDto>>> GetByAcuerdoDistrib(
        int idAcuerdoDistrib, CancellationToken ct)
    {
        var list = await _svc.GetByAcuerdoDistribAsync(idAcuerdoDistrib, ct);
        return Ok(list);
    }

    /// <summary>Obtiene autores por ID de unidad.</summary>
    [HttpGet("por-unidad/{idUnidad:int}")]
    public async Task<ActionResult<IReadOnlyList<AutorReadDto>>> GetByUnidad(
        int idUnidad, CancellationToken ct)
    {
        var list = await _svc.GetByUnidadAsync(idUnidad, ct);
        return Ok(list);
    }

    /// <summary>Obtiene autores por ID de persona.</summary>
    [HttpGet("por-persona/{idPersona:int}")]
    public async Task<ActionResult<IReadOnlyList<AutorReadDto>>> GetByPersona(
        int idPersona, CancellationToken ct)
    {
        var list = await _svc.GetByPersonaAsync(idPersona, ct);
        return Ok(list);
    }

    /// <summary>Crea un nuevo autor.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] AutorCreateDto body, CancellationToken ct)
    {
        try
        {
            var newId = await _svc.CreateAsync(body, ct);
            return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Actualización parcial (PATCH) de un autor existente.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] AutorPatchDto body, CancellationToken ct)
    {
        try
        {
            var success = await _svc.PatchAsync(id, body, ct);
            return success ? NoContent() : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Elimina un autor por su ID.</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var success = await _svc.DeleteAsync(id, ct);
        return success ? NoContent() : NotFound();
    }
}