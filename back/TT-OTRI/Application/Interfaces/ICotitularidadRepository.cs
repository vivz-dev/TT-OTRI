// ============================================================================
// File: Application/Interfaces/ICotitularidadRepository.cs
// Contrato de repositorio para Cotitularidad.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ICotitularidadRepository
{
    Task<IEnumerable<Cotitularidad>> GetAllAsync(CancellationToken ct = default);
    Task<Cotitularidad?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task<Cotitularidad?>             GetByTechnologyAsync(int technologyId, CancellationToken ct = default);
    Task AddAsync   (Cotitularidad entity, CancellationToken ct = default);
    Task UpdateAsync(Cotitularidad entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}