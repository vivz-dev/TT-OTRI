using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/espol-users")]
public sealed class EspolUsersController : ControllerBase
{
    private readonly IEspolUserService _service;

    public EspolUsersController(IEspolUserService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene un usuario de ESPOL.TBL_PERSONA por IDPERSONA.
    /// Devuelve: IdPersona, NumeroIdentifica, Apellidos, Nombres, Email, RidBitHex
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }
}