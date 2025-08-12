// ============================================================================
// File: Api/Controllers/ProteccionesController.cs
// Endpoints REST para la tabla de protecciones (Tecnología ↔ Tipo de protección):
//  GET    /api/protecciones
//  GET    /api/protecciones/{id}
//  GET    /api/tecnologias/{tecId}/protecciones
//  POST   /api/tecnologias/{tecId}/protecciones
//  PATCH  /api/protecciones/{id}
//  DELETE /api/protecciones/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
public class ProteccionesController : ControllerBase
{
    private readonly ProtectionService _svc;
    public ProteccionesController(ProtectionService svc) => _svc = svc;

    /// <summary>Lista todas las protecciones.</summary>
    [HttpGet("api/protecciones")]
    public async Task<ActionResult<IEnumerable<Protection>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>Lista protecciones por tecnología.</summary>
    [HttpGet("api/tecnologias/{tecId:int}/protecciones")]
    public async Task<ActionResult<IEnumerable<Protection>>> ByTechnology(int tecId)
        => Ok(await _svc.ListByTechnologyAsync(tecId));

    /// <summary>Detalle por Id.</summary>
    [HttpGet("api/protecciones/{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    /// <summary>Crea una protección para la tecnología indicada en la ruta.</summary>
    [HttpPost("api/tecnologias/{tecId:int}/protecciones")]
    public async Task<IActionResult> Create(int tecId, [FromBody] ProtectionCreateDto dto)
    {
        if (dto is null) return BadRequest();
        dto.TechnologyId = tecId;

        var created = await _svc.CreateAsync(dto);
        return created is null
            ? BadRequest("FK inválida o duplicado (tecnología, tipo de protección).")
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Parche parcial.</summary>
    [HttpPatch("api/protecciones/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] ProtectionPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>Elimina por Id.</summary>
    [HttpDelete("api/protecciones/{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
