using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/espol/role-links")]
[AllowAnonymous]
public sealed class RoleLinkController : ControllerBase
{
    private readonly IRoleLinkService _svc;
    public RoleLinkController(IRoleLinkService svc) => _svc = svc;

    [HttpGet("{idPersona:int}")]
    public async Task<IActionResult> GetRoleIds([FromRoute] int idPersona, CancellationToken ct)
    {
        var ids = await _svc.GetRoleIdsByPersonIdAsync(idPersona, ct);
        return Ok(new { idPersona, roleIds = ids });
    }
}