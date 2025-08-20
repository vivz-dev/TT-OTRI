// ============================================================================
// Application/Interfaces/IEspecialistaRepository.cs
// ============================================================================
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IEspecialistaRepository
{
    Task<IReadOnlyList<EspecialistaReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<EspecialistaReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(EspecialistaCreateDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, EspecialistaPatchDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}