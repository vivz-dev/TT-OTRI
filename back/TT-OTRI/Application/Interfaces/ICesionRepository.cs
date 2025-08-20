// ============================================================================
// Application/Interfaces/ICesionRepository.cs
// ============================================================================
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface ICesionRepository
{
    Task<IReadOnlyList<CesionReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<CesionReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(CesionCreateDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, CesionPatchDto dto, CancellationToken ct = default);
}