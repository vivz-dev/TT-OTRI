using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/espol-users")]
public sealed class EspolUsersController : ControllerBase
{
    private readonly EspolUserService _service;

    public EspolUsersController(EspolUserService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene un usuario por IDPERSONA desde ESPOL.TBL_PERSONA
    /// (IdPersona, NumeroIdentifica, Apellidos, Nombres, Email, RidBitHex)
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    /// <summary>
    /// Búsqueda typeahead por prefijo de EMAIL (case-insensitive, sin índices).
    /// GET /api/espol-users/search?q=vi&limit=8
    /// Devuelve lista corta de (IdPersona, Email, Apellidos, Nombres).
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int limit = 8, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new { items = Array.Empty<object>() });

        limit = Math.Clamp(limit, 1, 25);
        var items = await _service.SearchByEmailPrefixAsync(q.Trim(), limit, ct);
        return Ok(new { items });
    }
    /// <summary>
    /// Resuelve el IDPERSONA por email exacto (case-insensitive).
    /// GET /api/espol-users/id?email=usuario@espol.edu.ec
    /// </summary>
    [HttpGet("id")]
    public async Task<IActionResult> GetIdByEmail([FromQuery] string email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { error = "email requerido" });

        var id = await _service.GetIdByEmailAsync(email.Trim(), ct);
        if (id is null)
            return NotFound(new { email, message = "Persona no encontrada" });

        return Ok(new { email, idPersona = id.Value });
    }
}