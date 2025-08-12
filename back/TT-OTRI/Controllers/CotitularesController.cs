// ============================================================================
// File: Api/Controllers/CotitularesController.cs
// Endpoints REST para SOTRI.T_OTRI_TT_COTITULAR.
//  GET    /api/cotitulares
//  GET    /api/cotitulares/{id}
//  GET    /api/cotitularidades/{cotId}/cotitulares
//  POST   /api/cotitularidades/{cotId}/cotitulares
//  PATCH  /api/cotitulares/{id}
//  DELETE /api/cotitulares/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
public class CotitularesController : ControllerBase
{
    private readonly CotitularService _svc;
    public CotitularesController(CotitularService svc) => _svc = svc;

    /// <summary>Lista todos los cotitulares.</summary>
    [HttpGet("api/cotitulares")]
    public async Task<ActionResult<IEnumerable<Cotitular>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>Detalle por Id.</summary>
    [HttpGet("api/cotitulares/{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    /// <summary>Lista cotitulares por cotitularidad.</summary>
    [HttpGet("api/cotitularidades/{cotId:int}/cotitulares")]
    public async Task<ActionResult<IEnumerable<Cotitular>>> ByCotitularidad(int cotId)
        => Ok(await _svc.ListByCotitularidadAsync(cotId));

    /// <summary>Crea un cotitular bajo la cotitularidad indicada.</summary>
    [HttpPost("api/cotitularidades/{cotId:int}/cotitulares")]
    public async Task<IActionResult> Create(int cotId, [FromBody] CotitularCreateDto dto)
    {
        if (dto is null) return BadRequest();
        dto.CotitularidadId = cotId;

        var id = await _svc.CreateAsync(dto);
        return id is null
            ? BadRequest("FK inválida o ya existe el cotitular para esa institución en la cotitularidad.")
            : CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Parche parcial.</summary>
    [HttpPatch("api/cotitulares/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] CotitularPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>Elimina por Id.</summary>
    [HttpDelete("api/cotitulares/{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
