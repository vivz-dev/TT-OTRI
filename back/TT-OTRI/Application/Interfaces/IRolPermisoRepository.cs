// Application/Interfaces/IRolPermisoRepository.cs

using TT_OTRI.Application.DTOs;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IRolPermisoRepository
{
    Task<IEnumerable<RolPermiso>> GetAllAsync(CancellationToken ct = default);
    Task<RolPermiso?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(RolPermiso rolPermiso, CancellationToken ct = default);
    Task UpdateAsync(RolPermiso rolPermiso, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, RolPermisoPatchDto dto, CancellationToken ct = default);
}