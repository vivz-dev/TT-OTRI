// ============================================================================
// Controllers/RolPersonaController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/roles-persona")]
[Authorize] // Protegido por AppJwt (FallbackPolicy)
public sealed class RolPersonaController : ControllerBase
{
    private readonly RolPersonaService _svc;
    public RolPersonaController(RolPersonaService svc) => _svc = svc;

    /// <summary>
    /// Lista de personas con sus roles (solo TBL_ROL.CODIGOSISTEMA='OTRI').
    /// Incluye IdRolPersona en cada item de roles.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PersonaConRolesDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    /// <summary>Crea un nuevo registro en ESPOL.TBL_ROL_PERSONA.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] RolPersonaCreateDto body, CancellationToken ct)
    {
        if (body.IdPersona <= 0) return BadRequest("IdPersona es requerido.");
        if (body.IdRol     <= 0) return BadRequest("IdRol es requerido.");

        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetAll), null, new { id = newId });
    }

    /// <summary>PATCH parcial de ESPOL.TBL_ROL_PERSONA por su PK (IDROLESPERSONA).</summary>
    [HttpPatch("{idRolPersona:int}")]
    public async Task<ActionResult> Patch(int idRolPersona, [FromBody] RolPersonaPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(idRolPersona, body, ct);
        return ok ? NoContent() : NotFound();
    }

    /// <summary>Elimina un registro por IDROLESPERSONA.</summary>
    [HttpDelete("{idRolPersona:int}")]
    public async Task<ActionResult> Delete(int idRolPersona, CancellationToken ct)
    {
        var ok = await _svc.DeleteAsync(idRolPersona, ct);
        return ok ? NoContent() : NotFound();
    }
}
