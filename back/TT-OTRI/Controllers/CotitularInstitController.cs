// ============================================================================
// File: Api/Controllers/CotitularInstitController.cs
// Endpoints REST para SOTRI.T_OTRI_TT_COTITULARINSTIT
//  GET    /api/cotitular-instit
//  GET    /api/cotitular-instit/{id}
//  GET    /api/cotitular-instit/by-ruc/{ruc}
//  GET    /api/cotitular-instit/by-correo/{correo}
//  POST   /api/cotitular-instit
//  POST   /api/cotitular-instit/resolve   (idempotente por ruc/correo)
//  PATCH  /api/cotitular-instit/{id}
//  DELETE /api/cotitular-instit/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/cotitular-instit")]
public class CotitularInstitController : ControllerBase
{
    private readonly CotitularInstitService _svc;
    public CotitularInstitController(CotitularInstitService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CotitularInstit>>> GetAll()
        => Ok(await _svc.ListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();

    [HttpGet("by-ruc/{ruc}")]
    public async Task<IActionResult> GetByRuc(string ruc)
    {
        var all = await _svc.ListAsync();
        var e = all.FirstOrDefault(x => !string.IsNullOrEmpty(x.Ruc) &&
                                        string.Equals(x.Ruc, ruc, StringComparison.OrdinalIgnoreCase));
        return e is null ? NotFound() : Ok(e);
    }

    [HttpGet("by-correo/{correo}")]
    public async Task<IActionResult> GetByCorreo(string correo)
    {
        var all = await _svc.ListAsync();
        var e = all.FirstOrDefault(x => !string.IsNullOrEmpty(x.Correo) &&
                                        string.Equals(x.Correo, correo, StringComparison.OrdinalIgnoreCase));
        return e is null ? NotFound() : Ok(e);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CotitularInstitCreateDto dto)
    {
        var created = await _svc.CreateAsync(dto);
        return created is null
            ? BadRequest("Nombre requerido o duplicado por RUC/correo.")
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Idempotente: si existe por RUC/correo retorna existente; caso contrario, crea.
    /// </summary>
    [HttpPost("resolve")]
    public async Task<IActionResult> Resolve([FromBody] CotitularInstitCreateDto dto)
    {
        var e = await _svc.ResolveAsync(dto);
        return e is null
            ? BadRequest("Nombre requerido.")
            : Ok(e);
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] CotitularInstitPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
