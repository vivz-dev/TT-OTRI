using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public class PersonRolesService : IPersonRolesService
{
    private readonly IPersonLookupService _personSvc;
    private readonly IRoleLinkService _linkSvc;
    private readonly IRoleCatalogService _catSvc;

    public PersonRolesService(
        IPersonLookupService personSvc,
        IRoleLinkService linkSvc,
        IRoleCatalogService catSvc)
    {
        _personSvc = personSvc;
        _linkSvc = linkSvc;
        _catSvc = catSvc;
    }

    public async Task<(int? IdPersona, IReadOnlyList<int> RoleIds, IReadOnlyList<RoleDto> Roles)>
        GetPersonRolesByEmailAsync(string email, CancellationToken ct = default)
    {
        var id = await _personSvc.GetPersonIdByEmailAsync(email, ct);
        if (id is null) return (null, Array.Empty<int>(), Array.Empty<RoleDto>());

        var roleIds = await _linkSvc.GetRoleIdsByPersonIdAsync(id.Value, ct);
        var roles   = await _catSvc.GetRolesByIdsAsync(roleIds, ct);
        return (id, roleIds, roles);
    }
}