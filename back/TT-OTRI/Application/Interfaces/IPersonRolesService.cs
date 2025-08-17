using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IPersonRolesService
{
    /// <summary>Devuelve IdPersona, roleIds y roles (IdRol, Nombre) a partir del email.</summary>
    Task<(int? IdPersona, IReadOnlyList<int> RoleIds, IReadOnlyList<RoleDto> Roles)>
        GetPersonRolesByEmailAsync(string email, CancellationToken ct = default);
}