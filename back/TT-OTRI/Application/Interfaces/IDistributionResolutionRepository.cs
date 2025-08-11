// ============================================================================
// File: Application/Interfaces/IDistributionResolutionRepository.cs
// Contrato de acceso a datos (in-memory, EF, Dapper, etc.) para distribuciones
// asociadas a resoluciones. Define operaciones de lectura y escritura
// desacopladas de la infraestructura de persistencia.
// ============================================================================

using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

/// <summary>
/// Contrato del repositorio de distribuciones por resolución.
/// Provee operaciones CRUD mínimas y consultas por resolución.
/// </summary>
public interface IDistributionResolutionRepository
{
    /// <summary>
    /// Obtiene todas las distribuciones.
    /// </summary>
    /// <param name="ct">Token de cancelación opcional.</param>
    /// <returns>Colección enumerable de <see cref="DistributionResolution"/>.</returns>
    Task<IEnumerable<DistributionResolution>> GetAllAsync   (CancellationToken ct = default);

    /// <summary>
    /// Obtiene las distribuciones pertenecientes a una resolución específica.
    /// </summary>
    /// <param name="resolutionId">Identificador de la resolución (FK).</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    /// <returns>Colección enumerable filtrada por <paramref name="resolutionId"/>.</returns>
    Task<IEnumerable<DistributionResolution>> GetByResolutionAsync(
        int resolutionId, CancellationToken ct = default);

    /// <summary>
    /// Obtiene una distribución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la distribución.</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    /// <returns>La entidad encontrada o <c>null</c> si no existe.</returns>
    Task<DistributionResolution?> GetByIdAsync(int id, CancellationToken ct = default);

    /// <summary>
    /// Crea una nueva distribución.
    /// </summary>
    /// <param name="entity">Entidad a persistir.</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    Task AddAsync   (DistributionResolution entity, CancellationToken ct = default);

    /// <summary>
    /// Actualiza una distribución existente.
    /// </summary>
    /// <param name="entity">Entidad con los cambios a persistir.</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    Task UpdateAsync(DistributionResolution entity, CancellationToken ct = default);
}
