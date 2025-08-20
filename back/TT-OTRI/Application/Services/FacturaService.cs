// ============================================================================
// Application/Services/FacturaService.cs
// ============================================================================
using TT_OTRI.Domain;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class FacturaService
{
    private readonly IFacturaRepository _repo;

    public FacturaService(IFacturaRepository repo) => _repo = repo;

    public Task<IReadOnlyList<Factura>> GetAllAsync(CancellationToken ct) => _repo.GetAllAsync(ct);
    public Task<Factura?> GetByIdAsync(int id, CancellationToken ct) => _repo.GetByIdAsync(id, ct);

    public async Task<int> CreateAsync(FacturaCreateDto dto, CancellationToken ct)
    {
        if (dto.Monto < 0) throw new ArgumentException("El monto no puede ser negativo.");
        var entity = new Factura
        {
            IdRegistroPago = dto.IdRegistroPago,
            Monto          = dto.Monto,
            FechaFactura   = dto.FechaFactura.Date
        };
        return await _repo.CreateAsync(entity, ct);
    }

    public async Task<bool> PatchAsync(int id, FacturaPatchDto dto, CancellationToken ct)
    {
        if (dto.Monto.HasValue && dto.Monto.Value < 0)
            throw new ArgumentException("El monto no puede ser negativo.");
        return await _repo.PatchAsync(id, dto, ct);
    }
}