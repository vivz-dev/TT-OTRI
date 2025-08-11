// ============================================================================
// File: Application/Interfaces/IUserRoleRepository.cs
// Contrato de repositorio para Usuario–Rol.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IUserRoleRepository
{
    Task<IEnumerable<UserRole>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<UserRole>> GetByUserAsync(int usuarioId, CancellationToken ct = default);
    Task<UserRole?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<UserRole?> GetByUserAndRoleAsync(int usuarioId, int roleId, CancellationToken ct = default);
    Task AddAsync(UserRole entity, CancellationToken ct = default);
    Task UpdateAsync(UserRole entity, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}