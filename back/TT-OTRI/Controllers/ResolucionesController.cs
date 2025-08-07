// -------------------------------------------------------------------------
// File: Api/Controllers/ResolucionesController.cs
// Exposición HTTP REST para resolver peticiones sobre resoluciones.
// Endpoints: GET (lista / detalle), POST (crear) y PATCH (parcial).
// -------------------------------------------------------------------------
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/resoluciones")]
public class ResolucionesController : ControllerBase
{
    private readonly ResolutionService _svc;
    public ResolucionesController(ResolutionService svc) => _svc = svc;

    /*------------  GET /api/resoluciones  -------------------------------*/
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Resolution>>> GetAll()
        => Ok(await _svc.ListAsync());

    /*------------  GET /api/resoluciones/{id}  --------------------------*/
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } res ? Ok(res) : NotFound();

    /*------------  POST /api/resoluciones  ------------------------------*/
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ResolutionCreateDto dto)
    {
        if (dto is null) return BadRequest();
        var id = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, dto);
    }

    /*------------  PATCH /api/resoluciones/{id}  ------------------------*/
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] ResolutionPatchDto dto)
        => (dto is null)
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
}