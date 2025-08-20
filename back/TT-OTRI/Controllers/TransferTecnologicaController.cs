// ============================================================================
// Controllers/TransferTecnologicaController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/transfers")]
[Authorize] // Protegido con JWT interno (AppJwt)
public sealed class TransferTecnologicaController : ControllerBase
{
    private readonly TransferTecnologicaService _svc;

    public TransferTecnologicaController(TransferTecnologicaService svc)
    {
        _svc = svc;
    }

    /// <summary>Lista todas las transferencias tecnológicas.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransferTecnologicaReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    /// <summary>Obtiene una transferencia tecnológica por ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransferTecnologicaReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea una nueva transferencia tecnológica.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] TransferTecnologicaCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    /// <summary>PATCH parcial de una transferencia tecnológica.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] TransferTecnologicaPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}