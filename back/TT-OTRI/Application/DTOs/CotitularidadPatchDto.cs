// ============================================================================
// File: Application/DTOs/CotitularidadPatchDto.cs
// DTO para actualización parcial (PATCH) de una cotitularidad.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

/// <summary>
/// Campos opcionales para modificar una cotitularidad.
/// </summary>
public class CotitularidadPatchDto
{
    /// <summary>(Opcional) Nueva tecnología destino (FK).</summary>
    public int? TechnologyId { get; set; }
}