// ============================================================================
// File: Api/Controllers/RolesController.cs
// Rutas: GET, GET/{id}, POST, PATCH/{id}, DELETE/{id}.
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

/// <summary>
/// Controlador HTTP para Roles.
/// </summary>
[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly RoleService _svc;

    /// <summary>Constructor: inyecta RoleService.</summary>
    public RolesController(RoleService svc) => _svc = svc;

    /// <summary>GET /api/roles</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetAll()
        => Ok(await _svc.ListAsync());

    /// <summary>GET /api/roles/{id}</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } r ? Ok(r) : NotFound();

    /// <summary>POST /api/roles</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RoleCreateDto dto)
    {
        var e = await _svc.CreateAsync(dto);
        return e is null
            ? BadRequest("Nombre requerido.")
            : CreatedAtAction(nameof(GetById), new { id = e.Id }, e);
    }

    /// <summary>PATCH /api/roles/{id}</summary>
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] RolePatchDto dto)
        => dto is null
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    /// <summary>DELETE /api/roles/{id}</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}