// ============================================================================
// Controllers/TipoTransferTecnologicaController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/tipos-transferencia")]
[Authorize] // protegido por AppJwt (fallback policy en Program.cs)
public sealed class TipoTransferTecnologicaController : ControllerBase
{
    private readonly TipoTransferTecnologicaService _svc;

    public TipoTransferTecnologicaController(TipoTransferTecnologicaService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TipoTransferTTReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TipoTransferTTReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] TipoTransferTTCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] TipoTransferTTPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}