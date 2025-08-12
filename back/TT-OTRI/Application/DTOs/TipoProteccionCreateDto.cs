// ============================================================================
// File: Application/DTOs/TipoProteccionCreateDto.cs
// DTO para crear un tipo de protección (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class TipoProteccionCreateDto
{
    /// <summary>Nombre del tipo de protección (requerido).</summary>
    public string Nombre { get; set; } = string.Empty;
}