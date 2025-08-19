using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/cotitularidad-tecno")]
[Authorize] // Protección JWT (política por defecto)
public sealed class CotitularidadTecnoController : ControllerBase
{
    private readonly CotitularidadTecnoService _svc;

    public CotitularidadTecnoController(CotitularidadTecnoService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CotitularidadTecnoReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CotitularidadTecnoReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<CotitularidadTecnoReadDto>> Create(
        [FromBody] CotitularidadTecnoCreateDto dto, 
        CancellationToken ct)
    {
        var created = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<CotitularidadTecnoReadDto>> Update(
        int id,
        [FromBody] CotitularidadTecnoPatchDto dto,
        CancellationToken ct)
    {
        var updated = await _svc.UpdateAsync(id, dto, ct);
        return updated == null ? NotFound() : Ok(updated);
    }
}