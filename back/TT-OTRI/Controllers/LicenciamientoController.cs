// ============================================================================
// Controllers/LicenciamientoController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/licenciamientos")]
[Authorize]
public sealed class LicenciamientoController : ControllerBase
{
    private readonly LicenciamientoService _service;

    public LicenciamientoController(LicenciamientoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LicenciamientoReadDto>>> GetAll(CancellationToken ct)
    {
        var licenciamientos = await _service.GetAllAsync(ct);
        return Ok(licenciamientos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LicenciamientoReadDto>> GetById(int id, CancellationToken ct)
    {
        var licenciamiento = await _service.GetByIdAsync(id, ct);
        return licenciamiento is null ? NotFound() : Ok(licenciamiento);
    }

    [HttpPost]
    public async Task<ActionResult<LicenciamientoReadDto>> Create([FromBody] LicenciamientoCreateDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] LicenciamientoPatchDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var ok = await _service.UpdateAsync(id, dto, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _service.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
