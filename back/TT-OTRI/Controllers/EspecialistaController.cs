// ============================================================================
// Controllers/EspecialistaController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/especialistas")]
[Authorize] // Protegido con el JWT de la app (config por defecto en Program.cs)
public sealed class EspecialistaController : ControllerBase
{
    private readonly EspecialistaService _svc;

    public EspecialistaController(EspecialistaService svc)
    {
        _svc = svc;
    }

    /// <summary>Obtiene todos los especialistas.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EspecialistaReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    /// <summary>Obtiene un especialista por ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EspecialistaReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea un nuevo especialista.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] EspecialistaCreateDto body, CancellationToken ct)
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

    /// <summary>PATCH parcial de un especialista existente.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] EspecialistaPatchDto body, CancellationToken ct)
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

    /// <summary>Elimina un especialista por ID.</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _svc.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}