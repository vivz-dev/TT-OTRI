// ============================================================================
// File: Application/DTOs/CotitularCreateDto.cs
// DTO para crear un cotitular (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

/// <summary>
/// Datos para registrar un cotitular dentro de una cotitularidad.
/// </summary>
public class CotitularCreateDto
{
    /// <summary>FK a la cotitularidad.</summary>
    public int CotitularidadId { get; set; }

    /// <summary>FK a la institución cotitular.</summary>
    public int CotitularInstitId { get; set; }

    /// <summary>Id del usuario (ESPOL) que registra.</summary>
    public int IdUsuario { get; set; }

    /// <summary>Porcentaje referencial (0–1). Opcional.</summary>
    public decimal? PorcCotitularidad { get; set; }
}