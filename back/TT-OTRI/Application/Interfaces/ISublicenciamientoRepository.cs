using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface ISublicenciamientoRepository
{
    Task<IReadOnlyList<SublicenciamientoReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<SublicenciamientoReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(SublicenciamientoCreateDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, SublicenciamientoPatchDto dto, CancellationToken ct = default);
}