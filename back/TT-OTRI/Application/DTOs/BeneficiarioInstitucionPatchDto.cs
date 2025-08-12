// ============================================================================
// File: Application/DTOs/BeneficiarioInstitucionPatchDto.cs
// DTO para actualización parcial de un beneficiario institucional (PATCH).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class BeneficiarioInstitucionPatchDto
{
    /// <summary>Nuevo nombre (opcional).</summary>
    public string? Nombre { get; set; }
}