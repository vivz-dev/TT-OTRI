// ============================================================================
// File: Application/DTOs/AccionCreateDto.cs
// DTO para crear una nueva acción (POST). Excluye Id/fechas.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class AccionCreateDto
{
    /// <summary>Nombre de la acción (requerido).</summary>
    public string Nombre { get; set; } = string.Empty;
}