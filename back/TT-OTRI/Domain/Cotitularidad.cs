// ============================================================================
// File: Domain/Cotitularidad.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_COTITULARIDAD.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Representa el acuerdo de cotitularidad de una tecnología.
/// Por diseño, debe existir a lo sumo un registro por tecnología.
/// </summary>
public class Cotitularidad
{
    /// <summary>PK. Mapea a IDOTRTTCOTITULARIDAD.</summary>
    public int Id { get; set; }

    /// <summary>FK a tecnología. Mapea a IDOTRTTTECNOLOGIA.</summary>
    public int TechnologyId { get; set; }

    /// <summary>Fecha de creación (UTC). Mapea a CREATED_AT.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC). Mapea a UPDATED_AT.</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}