// Application/Interfaces/ITipoTransferenciaTecnoRepository.cs
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface ITipoTransferenciaTecnoRepository
{
    Task<IEnumerable<TipoTransferenciaTecnoReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<TipoTransferenciaTecnoReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(TipoTransferenciaTecnoCreateDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, TipoTransferenciaTecnoPatchDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}