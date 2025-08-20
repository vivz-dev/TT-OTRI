// Controllers/TipoTransferenciaTecnoController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/tipotransferenciatecno")]
[Authorize] // Protegido con JWT
public sealed class TipoTransferenciaTecnoController : ControllerBase
{
    private readonly TipoTransferenciaTecnoService _svc;

    public TipoTransferenciaTecnoController(TipoTransferenciaTecnoService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TipoTransferenciaTecnoReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TipoTransferenciaTecnoReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] TipoTransferenciaTecnoCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] TipoTransferenciaTecnoPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.UpdateAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var ok = await _svc.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}