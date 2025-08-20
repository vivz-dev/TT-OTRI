// Application/DTOs/RolPermisoDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class RolPermisoReadDto
{
    public int Id { get; set; }
    public int IdRol { get; set; }
    public int IdAccion { get; set; }
    public bool Visualizar { get; set; }
    public bool Editar { get; set; }
    public bool Inhabilitar { get; set; }
    public bool Crear { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class RolPermisoCreateDto
{
    public int IdRol { get; set; }
    public int IdAccion { get; set; }
    public bool Visualizar { get; set; }
    public bool Editar { get; set; }
    public bool Inhabilitar { get; set; }
    public bool Crear { get; set; }
}

public sealed class RolPermisoPatchDto
{
    public int? IdRol { get; set; }
    public int? IdAccion { get; set; }
    public bool? Visualizar { get; set; }
    public bool? Editar { get; set; }
    public bool? Inhabilitar { get; set; }
    public bool? Crear { get; set; }
}