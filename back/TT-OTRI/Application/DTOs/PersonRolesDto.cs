// ============================================================================
// File: Application/DTOs/PersonRolesDto.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class RoleItemDto
{
    public int IdRol { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public sealed class PersonRolesDto
{
    public string Email { get; set; } = string.Empty;
    public int? IdPersona { get; set; }
    public List<RoleItemDto> Roles { get; set; } = new();
}