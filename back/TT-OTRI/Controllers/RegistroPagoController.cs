// ============================================================================
// Controllers/RegistroPagoController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/registros-pago")]
[Authorize] // Protegido por AppJwt (FallbackPolicy en AuthSetup)
public sealed class RegistroPagoController : ControllerBase
{
    private readonly RegistroPagoService _svc;

    public RegistroPagoController(RegistroPagoService svc) => _svc = svc;

    /// <summary>Lista todos los registros de pago.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RegistroPagoReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    /// <summary>Obtiene un registro de pago por ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RegistroPagoReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea un registro de pago.</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] RegistroPagoCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    /// <summary>PATCH parcial de un registro de pago.</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] RegistroPagoPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}