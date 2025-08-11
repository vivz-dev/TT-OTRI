// ============================================================================
// File: Application/DTOs/RolePatchDto.cs
// DTO para PATCH de roles (todas las propiedades opcionales).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class RolePatchDto
{
    /// <summary>Nuevo nombre del rol (opcional).</summary>
    public string? Nombre { get; set; }
}