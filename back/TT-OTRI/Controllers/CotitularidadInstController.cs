// Controllers/CotitularidadInstController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/cotitularidad-institucional")]
[Authorize]
public sealed class CotitularidadInstController : ControllerBase
{
    private readonly CotitularidadInstService _service;

    public CotitularidadInstController(CotitularidadInstService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CotitularidadInstReadDto>>> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CotitularidadInstReadDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CotitularidadInstCreateDto dto, CancellationToken ct)
    {
        var id = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] CotitularidadInstPatchDto dto, CancellationToken ct)
    {
        var success = await _service.UpdateAsync(id, dto, ct);
        return success ? NoContent() : NotFound();
    }
}