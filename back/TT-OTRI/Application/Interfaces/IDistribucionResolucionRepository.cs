// ============================================================================
// Application/Interfaces/IDistribucionResolucionRepository.cs
// ============================================================================
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IDistribucionResolucionRepository
{
    Task<IReadOnlyList<DistribucionResolucionDto>> GetByResolucionAsync(int idResolucion, CancellationToken ct = default);
    Task<DistribucionResolucionDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(int idResolucion, CreateDistribucionResolucionDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, PatchDistribucionResolucionDto dto, CancellationToken ct = default);
}