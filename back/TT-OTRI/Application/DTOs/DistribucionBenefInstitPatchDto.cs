// ============================================================================
// File: Application/DTOs/DistribucionBenefInstitPatchDto.cs
// DTO para actualización parcial (PATCH).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class DistribucionBenefInstitPatchDto
{
    public int?     DistribucionResolucionId  { get; set; }
    public int?     BeneficiarioInstitucionId { get; set; }
    public decimal? Porcentaje                { get; set; }
}