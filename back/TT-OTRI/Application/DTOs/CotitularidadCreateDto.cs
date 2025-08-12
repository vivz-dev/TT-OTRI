// ============================================================================
// File: Application/DTOs/CotitularidadCreateDto.cs
// DTO para crear una cotitularidad (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

/// <summary>
/// Datos para crear una cotitularidad. Requiere la FK a tecnología.
/// </summary>
public class CotitularidadCreateDto
{
    /// <summary>Identificador de la tecnología (FK).</summary>
    public int TechnologyId { get; set; }
}