// ============================================================================
// Application/Interfaces/ITransferTecnologicaRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ITransferTecnologicaRepository
{
    Task<IReadOnlyList<TransferTecnologica>> GetAllAsync(CancellationToken ct = default);
    Task<TransferTecnologica?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(TransferTecnologica entity, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, IDictionary<string, object?> changes, CancellationToken ct = default);
}