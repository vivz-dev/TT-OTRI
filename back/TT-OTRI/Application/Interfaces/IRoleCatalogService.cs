using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IRoleCatalogService
{
    Task<IReadOnlyList<RoleDto>> GetRolesByIdsAsync(IEnumerable<int> ids, CancellationToken ct = default);
    Task<IReadOnlyList<RoleDto>> GetOtriRolesAsync(CancellationToken ct = default); // Nuevo método
}