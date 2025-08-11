// ============================================================================
// File: Application/DTOs/PermisoCreateDto.cs
// Datos requeridos para crear un permiso (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class PermisoCreateDto
{
    public int  RoleId    { get; set; }
    public int  AccionId  { get; set; }
    public bool Visualizar { get; set; } = false;
    public bool Editar     { get; set; } = false;
    public bool Inhabilitar{ get; set; } = false;
    public bool Crear      { get; set; } = false;
}