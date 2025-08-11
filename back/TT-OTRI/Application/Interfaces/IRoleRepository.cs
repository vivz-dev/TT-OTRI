// ============================================================================
// File: Application/Interfaces/IRoleRepository.cs
// Contrato de repositorio para Role (CRUD + Delete).
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

/// <summary>
/// Contrato del repositorio de roles.
/// </summary>
public interface IRoleRepository
{
    /// <summary>Obtiene todos los roles.</summary>
    Task<IEnumerable<Role>> GetAllAsync(CancellationToken ct = default);

    /// <summary>Obtiene un rol por Id.</summary>
    Task<Role?> GetByIdAsync(int id, CancellationToken ct = default);

    /// <summary>Crea un rol.</summary>
    Task AddAsync(Role entity, CancellationToken ct = default);

    /// <summary>Actualiza un rol.</summary>
    Task UpdateAsync(Role entity, CancellationToken ct = default);

    /// <summary>Elimina un rol por Id.</summary>
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}