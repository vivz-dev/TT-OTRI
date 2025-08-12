// ============================================================================
// File: Application/DTOs/TipoProteccionPatchDto.cs
// DTO para actualización parcial (PATCH) de un tipo de protección.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class TipoProteccionPatchDto
{
    /// <summary>Nuevo nombre (opcional).</summary>
    public string? Nombre { get; set; }
}