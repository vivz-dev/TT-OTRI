// ============================================================================
// File: Api/Controllers/TiposProteccionController.cs
// Endpoints REST del catálogo Tipos de protección:
//  GET    /api/tipos-proteccion
//  GET    /api/tipos-proteccion/{id}
//  POST   /api/tipos-proteccion
//  PATCH  /api/tipos-proteccion/{id}
//  DELETE /api/tipos-proteccion/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/tipos-proteccion")]
public class TiposProteccionController : ControllerBase
{
    private readonly TipoProteccionService _svc;
    public TiposProteccionController(TipoProteccionService svc) => _svc = svc;

    /// <summary>Lista todos los tipos de protección.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TipoProteccion>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>Detalle por Id.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    /// <summary>Crea un tipo de protección (valida duplicados por nombre).</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TipoProteccionCreateDto dto)
    {
        var created = await _svc.CreateAsync(dto);
        return created is null
            ? BadRequest("Nombre requerido o duplicado.")
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Parche parcial (valida duplicados por nombre).</summary>
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] TipoProteccionPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>Elimina por Id.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
