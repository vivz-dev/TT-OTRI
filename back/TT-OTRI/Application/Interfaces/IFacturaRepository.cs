// ============================================================================
// Application/Interfaces/IFacturaRepository.cs
// ============================================================================
using TT_OTRI.Domain;
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IFacturaRepository
{
    Task<IReadOnlyList<Factura>> GetAllAsync(CancellationToken ct = default);
    Task<Factura?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(Factura entity, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, FacturaPatchDto patch, CancellationToken ct = default);
}