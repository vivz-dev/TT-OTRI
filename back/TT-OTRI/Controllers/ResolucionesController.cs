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
public class ResolucionesController : ControllerBase
{
    private readonly IResolutionService _svc;

    public ResolucionesController(IResolutionService svc) => _svc = svc;

    [HttpGet]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<ActionResult<IEnumerable<Resolution>>> GetAll()
        => Ok(await _svc.ListAsync());

    [HttpGet("{id:int}")]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } res ? Ok(res) : NotFound();

    [HttpPost]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<IActionResult> Create([FromBody] ResolutionCreateDto dto)
    {
        if (dto is null) return BadRequest();
        var entity = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPatch("{id:int}")]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<IActionResult> Patch(int id, [FromBody] ResolutionPatchDto dto)
        => (dto is null)
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
}