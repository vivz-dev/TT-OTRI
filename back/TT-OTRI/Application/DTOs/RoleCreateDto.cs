// ============================================================================
// File: Application/DTOs/RoleCreateDto.cs
// DTO para POST de roles. Excluye Id/fechas (las llena el backend).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class RoleCreateDto
{
    /// <summary>Nombre del rol (requerido).</summary>
    public string Nombre { get; set; } = string.Empty;
}