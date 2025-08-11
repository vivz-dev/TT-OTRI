// ============================================================================
// File: Application/Interfaces/IPermisoRepository.cs
// Contrato de repositorio para Permiso (CRUD + consultas por rol y par rol/acción).
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IPermisoRepository
{
    Task<IEnumerable<Permiso>> GetAllAsync          (CancellationToken ct = default);
    Task<IEnumerable<Permiso>> GetByRoleAsync       (int roleId, CancellationToken ct = default);
    Task<Permiso?>             GetByIdAsync         (int id, CancellationToken ct = default);
    Task<Permiso?>             GetByRoleAndAccionAsync(int roleId, int accionId, CancellationToken ct = default);
    Task AddAsync   (Permiso entity, CancellationToken ct = default);
    Task UpdateAsync(Permiso entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}