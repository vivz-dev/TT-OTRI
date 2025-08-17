using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Api.Controllers;

[ApiController]
[Route("api/espol/person")]
[AllowAnonymous] // quita si quieres exigir JWT
public sealed class PersonLookupController : ControllerBase
{
    private readonly IPersonLookupService _svc;
    public PersonLookupController(IPersonLookupService svc) => _svc = svc;

    [HttpGet("by-email")]
    public async Task<IActionResult> GetByEmail([FromQuery] string email, CancellationToken ct)
    {
        var id = await _svc.GetPersonIdByEmailAsync(email, ct);
        return id is null
            ? NotFound(new { email, message = "Persona no encontrada" })
            : Ok(new { email, idPersona = id.Value });
    }
}