// ============================================================================
// File: Domain/DistribucionBenefInstit.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_DISTRIBUCIONBENEFINSTIT.
// Relaciona una distribución de resolución con un beneficiario institucional
// y el porcentaje asignado.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Relación Distribución ↔ Beneficiario Institucional con porcentaje asignado.
/// </summary>
public class DistribucionBenefInstit
{
    /// <summary>PK. Mapea a IDOTRTTDISTRIBUCIONBENEFINSTIT.</summary>
    public int Id { get; set; }

    /// <summary>FK a distribución de resolución. Mapea a IDOTRTTDISTRIBUCIONRESOLUCION.</summary>
    public int DistribucionResolucionId { get; set; }

    /// <summary>FK a beneficiario institucional. Mapea a IDOTRTTBENEFICIARIOINSTITUCION.</summary>
    public int BeneficiarioInstitucionId { get; set; }

    /// <summary>Porcentaje (0–1) asignado a este beneficiario institucional.</summary>
    public decimal Porcentaje { get; set; }

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}