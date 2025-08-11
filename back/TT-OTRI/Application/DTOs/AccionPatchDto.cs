// ============================================================================
// File: Application/DTOs/AccionPatchDto.cs
// DTO para actualización parcial de una acción (PATCH).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class AccionPatchDto
{
    /// <summary>Nuevo nombre de la acción (opcional).</summary>
    public string? Nombre { get; set; }
}