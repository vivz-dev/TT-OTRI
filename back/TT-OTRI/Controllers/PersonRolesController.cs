using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/espol/person-roles")]
[AllowAnonymous]
public sealed class PersonRolesController : ControllerBase
{
    private readonly IPersonRolesService _svc;
    public PersonRolesController(IPersonRolesService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetByEmail([FromQuery] string email, CancellationToken ct)
    {
        var (id, roleIds, roles) = await _svc.GetPersonRolesByEmailAsync(email, ct);
        if (id is null) return NotFound(new { email, message = "Persona no encontrada" });

        return Ok(new { email, idPersona = id.Value, roleIds, roles });
    }
}