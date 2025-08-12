// ============================================================================
// File: Application/DTOs/TechnologyCreateDto.cs
// DTO para crear una tecnología (POST).
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

/// <summary>
/// Campos requeridos para crear una tecnología.
/// </summary>
public class TechnologyCreateDto
{
    /// <summary>FK usuario (requerido).</summary>
    public int IdUsuario { get; set; }

    /// <summary>Título (requerido).</summary>
    public string Titulo { get; set; } = string.Empty;

    /// <summary>Descripción (opcional).</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Estado inicial (opcional, por defecto 'D').</summary>
    public TechnologyStatus Estado { get; set; } = TechnologyStatus.Disponible;

    /// <summary>Marca de completitud (opcional, por defecto false).</summary>
    public bool Completed { get; set; } = false;

    /// <summary>Cotitularidad (opcional, por defecto false).</summary>
    public bool Cotitularidad { get; set; } = false;
}