using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/cotitulares")]
[Authorize]
public sealed class CotitularController : ControllerBase
{
    private readonly CotitularService _service;

    public CotitularController(CotitularService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CotitularReadDto>>> GetAll(CancellationToken ct)
    {
        var cotitulares = await _service.GetAllAsync(ct);
        return Ok(cotitulares);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CotitularReadDto>> GetById(int id, CancellationToken ct)
    {
        var cotitular = await _service.GetByIdAsync(id, ct);
        return cotitular != null ? Ok(cotitular) : NotFound();
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CotitularCreateDto dto, CancellationToken ct)
    {
        var id = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] CotitularCreateDto dto, CancellationToken ct)
    {
        await _service.UpdateAsync(id, dto, ct);
        return NoContent();
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] CotitularPatchDto dto, CancellationToken ct)
    {
        var success = await _service.PatchAsync(id, dto, ct);
        return success ? NoContent() : NotFound();
    }
}