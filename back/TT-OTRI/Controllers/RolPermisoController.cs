// Controllers/RolPermisoController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/rol-permisos")]
[Authorize]
public sealed class RolPermisoController : ControllerBase
{
    private readonly RolPermisoService _service;

    public RolPermisoController(RolPermisoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RolPermiso>>> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RolPermiso>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] RolPermisoCreateDto dto, CancellationToken ct)
    {
        var id = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] RolPermisoCreateDto dto, CancellationToken ct)
    {
        try
        {
            await _service.UpdateAsync(id, dto, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] RolPermisoPatchDto dto, CancellationToken ct)
    {
        var success = await _service.PatchAsync(id, dto, ct);
        return success ? NoContent() : NotFound();
    }
}