using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/tipos-proteccion")]
[Authorize] // Protegido con JWT
public sealed class TipoProteccionController : ControllerBase
{
    private readonly TipoProteccionService _svc;

    public TipoProteccionController(TipoProteccionService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TipoProteccionReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TipoProteccionReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] TipoProteccionCreateDto body, CancellationToken ct)
    {
        var id = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] TipoProteccionPatchDto body, CancellationToken ct)
    {
        await _svc.UpdateAsync(id, body, ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _svc.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }
}