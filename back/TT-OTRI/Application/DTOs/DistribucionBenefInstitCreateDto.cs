// ============================================================================
// File: Application/DTOs/DistribucionBenefInstitCreateDto.cs
// DTO para crear un registro de distribución ↔ beneficiario institucional.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class DistribucionBenefInstitCreateDto
{
    /// <summary>FK distribución de resolución.</summary>
    public int DistribucionResolucionId { get; set; }

    /// <summary>FK beneficiario institucional.</summary>
    public int BeneficiarioInstitucionId { get; set; }

    /// <summary>Porcentaje (0–1).</summary>
    public decimal Porcentaje { get; set; }
}