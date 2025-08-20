// ============================================================================
// Application/Interfaces/IRegistroPagoRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IRegistroPagoRepository
{
    Task<IReadOnlyList<RegistroPago>> GetAllAsync(CancellationToken ct = default);
    Task<RegistroPago?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(RegistroPago entity, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, RegistroPago partial, CancellationToken ct = default);
}