// ============================================================================
// File: Domain/TipoProteccion.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_TIPOPROTECCION.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Catálogo de tipos de protección de PI (p.ej., Secreto Empresarial, Patente, etc.).
/// </summary>
public class TipoProteccion
{
    /// <summary>PK. Mapea a IDOTRTTTIPOPROTECCION.</summary>
    public int Id { get; set; }

    /// <summary>Nombre del tipo de protección.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}