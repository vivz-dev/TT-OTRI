// ============================================================================
// File: Application/Interfaces/IResolutionRepository.cs
// Contrato de acceso a datos para la entidad Resolution.  Permite CRUD
// asíncrono y abstrae la infraestructura (EF Core, Dapper, etc.).
// ============================================================================

using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

/// <summary>
/// Contrato del repositorio de resoluciones. Define operaciones de lectura y
/// escritura desacopladas de la tecnología de persistencia.
/// </summary>
public interface IResolutionRepository
{
    /// <summary>
    /// Obtiene todas las resoluciones.
    /// </summary>
    /// <param name="ct">Token de cancelación opcional.</param>
    /// <returns>Colección enumerable de <see cref="Resolution"/>.</returns>
    Task<IEnumerable<Resolution>> GetAllAsync (CancellationToken ct = default);

    /// <summary>
    /// Obtiene una resolución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la resolución.</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    /// <returns>La entidad encontrada o <c>null</c> si no existe.</returns>
    Task<Resolution?>             GetByIdAsync(int id, CancellationToken ct = default);

    /// <summary>
    /// Agrega una nueva resolución al almacén.
    /// </summary>
    /// <param name="resolution">Entidad a crear.</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    Task AddAsync   (Resolution resolution, CancellationToken ct = default);

    /// <summary>
    /// Actualiza una resolución existente.
    /// </summary>
    /// <param name="resolution">Entidad con los cambios a persistir.</param>
    /// <param name="ct">Token de cancelación opcional.</param>
    Task UpdateAsync(Resolution resolution, CancellationToken ct = default);
}