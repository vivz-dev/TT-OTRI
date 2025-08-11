// ============================================================================
// File: Api/Controllers/AccionesController.cs
// Endpoints REST para Acciones: GET, GET/{id}, POST, PATCH/{id}, DELETE/{id}.
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

/// <summary>Controlador HTTP para Acciones del sistema.</summary>
[ApiController]
[Route("api/acciones")]
public class AccionesController : ControllerBase
{
    private readonly AccionService _svc;
    public AccionesController(AccionService svc) => _svc = svc;

    /// <summary>GET /api/acciones</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Accion>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>GET /api/acciones/{id}</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    /// <summary>POST /api/acciones</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AccionCreateDto dto)
    {
        var e = await _svc.CreateAsync(dto);
        return e is null
            ? BadRequest("Nombre requerido.")
            : CreatedAtAction(nameof(GetById), new { id = e.Id }, e);
    }

    /// <summary>PATCH /api/acciones/{id}</summary>
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] AccionPatchDto dto)
        => dto is null
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>DELETE /api/acciones/{id}</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}