// ============================================================================
// Application/Interfaces/ITipoTransferTecnologicaRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ITipoTransferTecnologicaRepository
{
    Task<IReadOnlyList<TipoTransferTecnologica>> GetAllAsync(CancellationToken ct = default);
    Task<TipoTransferTecnologica?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(TipoTransferTecnologica entity, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, string? nombre, CancellationToken ct = default);
}