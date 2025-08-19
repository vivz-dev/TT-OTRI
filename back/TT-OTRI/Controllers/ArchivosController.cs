using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/archivos")]
[Authorize] // Si usas un esquema explícito, usa: [Authorize(AuthenticationSchemes = "AppJwt")]
public sealed class ArchivosController : ControllerBase
{
    private readonly ArchivoService _svc;

    public ArchivosController(ArchivoService svc) => _svc = svc;

    // GET /api/archivos
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ArchivoDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    // GET /api/archivos/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ArchivoDto>> GetById([FromRoute] int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    // POST /api/archivos
    [HttpPost]
    public async Task<ActionResult<ArchivoDto>> Create([FromBody] CreateArchivoDto body, CancellationToken ct)
    {
        var created = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PATCH /api/archivos/{id}
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch([FromRoute] int id, [FromBody] UpdateArchivoDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}