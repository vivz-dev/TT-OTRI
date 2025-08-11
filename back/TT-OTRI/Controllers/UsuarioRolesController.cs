// ============================================================================
// File: Api/Controllers/UsuarioRolesController.cs
// Rutas: 
// - GET /api/usuario-roles
// - GET /api/usuario-roles/{id}
// - GET /api/usuarios/{usuarioId}/roles
// - POST /api/usuarios/{usuarioId}/roles
// - PATCH /api/usuario-roles/{id}
// - DELETE /api/usuario-roles/{id}
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Api.Controllers;

[ApiController]
public class UsuarioRolesController : ControllerBase
{
    private readonly UserRoleService _svc;
    public UsuarioRolesController(UserRoleService svc) => _svc = svc;

    [HttpGet("api/usuario-roles")]
    public async Task<ActionResult<IEnumerable<UserRole>>> GetAll()
        => Ok(await _svc.ListAsync());

    [HttpGet("api/usuario-roles/{id:int}")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } ur ? Ok(ur) : NotFound();

    [HttpGet("api/usuarios/{usuarioId:int}/roles")]
    public async Task<ActionResult<IEnumerable<UserRole>>> ByUser(int usuarioId)
        => Ok(await _svc.ListByUserAsync(usuarioId));

    [HttpPost("api/usuarios/{usuarioId:int}/roles")]
    public async Task<IActionResult> Create(int usuarioId, [FromBody] UserRoleCreateDto dto)
    {
        if (dto is null) return BadRequest();
        dto.UsuarioId = usuarioId;

        var created = await _svc.CreateAsync(dto);
        return created is null
            ? BadRequest("Usuario/Rol no válido o relación duplicada.")
            : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("api/usuario-roles/{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] UserRolePatchDto dto)
        => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("api/usuario-roles/{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
