using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/sublicenciamientos")]
[Authorize] // usa la FallbackPolicy (AppJwtOnly)
public sealed class SublicenciamientoController : ControllerBase
{
    private readonly SublicenciamientoService _svc;

    public SublicenciamientoController(SublicenciamientoService svc) => _svc = svc;

    /// <summary>Lista todos los registros.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SublicenciamientoReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    /// <summary>Obtiene un registro por ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SublicenciamientoReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea un registro.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] SublicenciamientoCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    /// <summary>Actualiza parcialmente (PATCH) un registro.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] SublicenciamientoPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}