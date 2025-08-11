// ============================================================================
// File: Application/DTOs/UserRolePatchDto.cs
// DTO para actualización parcial de Usuario–Rol.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class UserRolePatchDto
{
    public int? UsuarioId { get; set; }
    public int? RoleId    { get; set; }
}