using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/espol/roles")]
[AllowAnonymous]
public sealed class RoleCatalogController : ControllerBase
{
    private readonly IRoleCatalogService _svc;
    public RoleCatalogController(IRoleCatalogService svc) => _svc = svc;

    [HttpGet("by-ids")]
    public async Task<IActionResult> GetByIds([FromQuery] string ids, CancellationToken ct)
    {
        var arr = (ids ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => int.TryParse(s, out var v) ? v : (int?)null)
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .ToList();

        var roles = await _svc.GetRolesByIdsAsync(arr, ct);
        return Ok(roles);
    }
}