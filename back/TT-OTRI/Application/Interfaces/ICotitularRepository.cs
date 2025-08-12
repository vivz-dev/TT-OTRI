// ============================================================================
// File: Application/Interfaces/ICotitularRepository.cs
// Contrato de repositorio para Cotitular.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ICotitularRepository
{
    Task<IEnumerable<Cotitular>> GetAllAsync(CancellationToken ct = default);
    Task<Cotitular?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<Cotitular>> GetByCotitularidadAsync(int cotitularidadId, CancellationToken ct = default);

    /// <summary>Busca un cotitular por el par (CotitularidadId, CotitularInstitId).</summary>
    Task<Cotitular?> GetByPairAsync(int cotitularidadId, int cotitularInstitId, CancellationToken ct = default);

    Task AddAsync   (Cotitular entity, CancellationToken ct = default);
    Task UpdateAsync(Cotitular entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}