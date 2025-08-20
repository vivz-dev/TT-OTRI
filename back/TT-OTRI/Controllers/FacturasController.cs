// ============================================================================
// Controllers/FacturasController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/facturas")]
[Authorize] // Protegido con AppJwt por política fallback configurada en Program.cs
public sealed class FacturasController : ControllerBase
{
    private readonly FacturaService _svc;

    public FacturasController(FacturaService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FacturaReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        var dto  = list.Select(f => new FacturaReadDto
        {
            IdFactura      = f.IdFactura,
            IdRegistroPago = f.IdRegistroPago,
            Monto          = f.Monto,
            FechaFactura   = f.FechaFactura,
            FechaCreacion  = f.CreatedAt,
            UltimoCambio   = f.UpdatedAt
        }).ToList();
        return Ok(dto);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FacturaReadDto>> GetById(int id, CancellationToken ct)
    {
        var f = await _svc.GetByIdAsync(id, ct);
        if (f is null) return NotFound();

        return Ok(new FacturaReadDto
        {
            IdFactura      = f.IdFactura,
            IdRegistroPago = f.IdRegistroPago,
            Monto          = f.Monto,
            FechaFactura   = f.FechaFactura,
            FechaCreacion  = f.CreatedAt,
            UltimoCambio   = f.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] FacturaCreateDto body, CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] FacturaPatchDto body, CancellationToken ct)
    {
        var ok = await _svc.PatchAsync(id, body, ct);
        return ok ? NoContent() : NotFound();
    }
}
