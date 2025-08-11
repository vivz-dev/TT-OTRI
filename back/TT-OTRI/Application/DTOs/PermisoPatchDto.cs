// ============================================================================
// File: Application/DTOs/PermisoPatchDto.cs
// DTO para actualización parcial de un permiso (PATCH).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class PermisoPatchDto
{
    public int?  RoleId     { get; set; }
    public int?  AccionId   { get; set; }
    public bool? Visualizar { get; set; }
    public bool? Editar     { get; set; }
    public bool? Inhabilitar{ get; set; }
    public bool? Crear      { get; set; }
}