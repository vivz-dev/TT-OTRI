// ============================================================================
// File: Application/Interfaces/ITechnologyRepository.cs
// Contrato de repositorio para tecnologías.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ITechnologyRepository
{
    Task<IEnumerable<Technology>> GetAllAsync (CancellationToken ct = default);
    Task<Technology?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync   (Technology entity, CancellationToken ct = default);
    Task UpdateAsync(Technology entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}