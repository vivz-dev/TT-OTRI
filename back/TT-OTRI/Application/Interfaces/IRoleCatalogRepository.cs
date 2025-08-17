using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IRoleCatalogRepository
{
    Task<IReadOnlyList<RoleDto>> GetRolesByIdsAsync(IEnumerable<int> ids, CancellationToken ct = default);
}