// ============================================================================
// File: Application/Interfaces/IProtectionRepository.cs
// Contrato de repositorio para Protection.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IProtectionRepository
{
    Task<IEnumerable<Protection>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<Protection>> GetByTechnologyAsync(int technologyId, CancellationToken ct = default);
    Task<Protection?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task<Protection?>             GetByPairAsync(int technologyId, int tipoProteccionId, CancellationToken ct = default);
    Task AddAsync   (Protection entity, CancellationToken ct = default);
    Task UpdateAsync(Protection entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}