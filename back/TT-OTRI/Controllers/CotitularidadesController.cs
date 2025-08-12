// ============================================================================
// File: Api/Controllers/CotitularidadesController.cs
// Endpoints REST para SOTRI.T_OTRI_TT_COTITULARIDAD:
//  GET    /api/cotitularidades
//  GET    /api/cotitularidades/{id}
//  GET    /api/tecnologias/{tecId}/cotitularidad
//  POST   /api/tecnologias/{tecId}/cotitularidad
//  PATCH  /api/cotitularidades/{id}
//  DELETE /api/cotitularidades/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
public class CotitularidadesController : ControllerBase
{
    private readonly CotitularidadService _svc;
    public CotitularidadesController(CotitularidadService svc) => _svc = svc;

    /// <summary>Lista todas las cotitularidades.</summary>
    [HttpGet("api/cotitularidades")]
    public async Task<ActionResult<IEnumerable<Cotitularidad>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>Detalle por Id.</summary>
    [HttpGet("api/cotitularidades/{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    /// <summary>Obtiene la cotitularidad de una tecnología (si existe).</summary>
    [HttpGet("api/tecnologias/{tecId:int}/cotitularidad")]
    public async Task<IActionResult> ByTechnology(int tecId)
        => await _svc.GetByTechnologyAsync(tecId) is { } e ? Ok(e) : NotFound();

    /// <summary>Crea la cotitularidad para la tecnología indicada.</summary>
    [HttpPost("api/tecnologias/{tecId:int}/cotitularidad")]
    public async Task<IActionResult> Create(int tecId, [FromBody] CotitularidadCreateDto dto)
    {
        if (dto is null) return BadRequest();
        dto.TechnologyId = tecId;

        var created = await _svc.CreateAsync(dto);
        return created is null
            ? BadRequest("FK inválida o la tecnología ya tiene cotitularidad.")
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Parche parcial.</summary>
    [HttpPatch("api/cotitularidades/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] CotitularidadPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>Elimina por Id.</summary>
    [HttpDelete("api/cotitularidades/{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
