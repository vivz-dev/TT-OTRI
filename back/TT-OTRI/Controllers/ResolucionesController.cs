// -------------------------------------------------------------------------
// File: Api/Controllers/ResolucionesController.cs
// Controlador HTTP para gestionar resoluciones.
// -------------------------------------------------------------------------
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/resoluciones")]
[Authorize(AuthenticationSchemes = "AppJwt")]
public class ResolucionesController : ControllerBase
{
    private readonly IResolutionService _svc;

    public ResolucionesController(IResolutionService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Resolution>>> GetAll()
        => Ok(await _svc.ListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } res ? Ok(res) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ResolutionCreateDto dto)
    {
        if (dto is null) return BadRequest();
        var entity = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] ResolutionPatchDto dto)
        => (dto is null)
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
}