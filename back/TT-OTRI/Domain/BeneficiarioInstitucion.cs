// ============================================================================
// File: Domain/BeneficiarioInstitucion.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_BENEFICIARIOINSTITUCION.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Grupo de beneficiario de tipo institucional (p.ej., OTRI, ESPOL, Unidades/Centros).
/// </summary>
public class BeneficiarioInstitucion
{
    /// <summary>PK. Mapea a IDOTRTTBENEFICIARIOINSTITUCION.</summary>
    public int Id { get; set; }

    /// <summary>Nombre del grupo institucional.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}