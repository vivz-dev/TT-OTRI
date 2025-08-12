// ============================================================================
// File: Api/Controllers/TecnologiasController.cs
// Endpoints REST de tecnologías:
//  GET    /api/tecnologias
//  GET    /api/tecnologias/{id}
//  POST   /api/tecnologias
//  PATCH  /api/tecnologias/{id}
//  DELETE /api/tecnologias/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/tecnologias")]
public class TecnologiasController : ControllerBase
{
    private readonly TechnologyService _svc;
    public TecnologiasController(TechnologyService svc) => _svc = svc;

    /// <summary>Lista todas las tecnologías.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Technology>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>Detalle por Id.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    /// <summary>Crea una tecnología.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TechnologyCreateDto dto)
    {
        if (dto is null) return BadRequest();
        var entity = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    /// <summary>Parche parcial.</summary>
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] TechnologyPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>Elimina por Id.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}