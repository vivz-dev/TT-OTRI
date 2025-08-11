// ============================================================================
// File: Application/DTOs/UserRoleCreateDto.cs
// Datos requeridos para crear una relación Usuario–Rol.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class UserRoleCreateDto
{
    public int UsuarioId { get; set; }
    public int RoleId    { get; set; }
}