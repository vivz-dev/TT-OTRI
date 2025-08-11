// ============================================================================
// File: Api/Controllers/PermisosController.cs
// Rutas:
// - GET    /api/permisos
// - GET    /api/permisos/{id}
// - GET    /api/roles/{roleId}/permisos
// - POST   /api/roles/{roleId}/permisos
// - PATCH  /api/permisos/{id}
// - DELETE /api/permisos/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
public class PermisosController : ControllerBase
{
    private readonly PermisoService _svc;
    public PermisosController(PermisoService svc) => _svc = svc;

    [HttpGet("api/permisos")]
    public async Task<ActionResult<IEnumerable<Permiso>>> GetAll()
        => Ok(await _svc.ListAsync());

    [HttpGet("api/permisos/{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } p ? Ok(p) : NotFound();

    [HttpGet("api/roles/{roleId:int}/permisos")]
    public async Task<ActionResult<IEnumerable<Permiso>>> ByRole(int roleId)
        => Ok(await _svc.ListByRoleAsync(roleId));

    [HttpPost("api/roles/{roleId:int}/permisos")]
    public async Task<IActionResult> Create(int roleId, [FromBody] PermisoCreateDto dto)
    {
        if (dto is null) return BadRequest();
        dto.RoleId = roleId;

        var created = await _svc.CreateAsync(dto);
        return created is null
            ? BadRequest("Rol/Acción no válido o permiso duplicado.")
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("api/permisos/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] PermisoPatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("api/permisos/{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
