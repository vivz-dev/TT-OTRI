using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public class RoleCatalogService : IRoleCatalogService
{
    private readonly IRoleCatalogRepository _repo;
    public RoleCatalogService(IRoleCatalogRepository repo) => _repo = repo;

    public Task<IReadOnlyList<RoleDto>> GetRolesByIdsAsync(IEnumerable<int> ids, CancellationToken ct = default)
        => _repo.GetRolesByIdsAsync(ids, ct);

    // Nuevo método
    public Task<IReadOnlyList<RoleDto>> GetOtriRolesAsync(CancellationToken ct = default)
        => _repo.GetOtriRolesAsync(ct);
}