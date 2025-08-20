// ============================================================================
// Application/Interfaces/IUnidadRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IUnidadRepository
{
    Task<IReadOnlyList<Unidad>> GetAllActivasAsync(CancellationToken ct = default);
    Task<Unidad?> GetByIdActivaAsync(int id, CancellationToken ct = default);
}