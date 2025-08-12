// ============================================================================
// File: Application/DTOs/CotitularInstitCreateDto.cs
// DTO para crear un cotitular institucional (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class CotitularInstitCreateDto
{
    /// <summary>Nombre de la institución (requerido).</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Correo (opcional, usado para evitar duplicados si se provee).</summary>
    public string? Correo { get; set; }

    /// <summary>RUC (opcional, usado para evitar duplicados si se provee).</summary>
    public string? Ruc { get; set; }
}