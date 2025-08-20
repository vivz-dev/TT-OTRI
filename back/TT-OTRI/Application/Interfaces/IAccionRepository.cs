// ============================================================================
// Application/Interfaces/IAccionRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IAccionRepository
{
    Task<IReadOnlyList<Accion>> GetAllAsync(CancellationToken ct = default);
    Task<Accion?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(Accion a, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, string? nombre, CancellationToken ct = default);
}