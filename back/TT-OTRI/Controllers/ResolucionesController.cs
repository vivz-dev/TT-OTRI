using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/resoluciones")]
public class ResolucionesController : ControllerBase
{
    private readonly ResolutionService _svc;
    public ResolucionesController(ResolutionService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _svc.ListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
        => (await _svc.GetAsync(id)) is { } res ? Ok(res) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Resolution dto)
    {
        await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
    }
    
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] ResolutionPatchDto dto)
    {
        if (dto is null) return BadRequest();

        var ok = await _svc.PatchAsync(id, dto);
        return ok ? NoContent() : NotFound();
    }

}