// ============================================================================
// File: Application/DTOs/BeneficiarioInstitucionCreateDto.cs
// DTO para crear un beneficiario institucional (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class BeneficiarioInstitucionCreateDto
{
    /// <summary>Nombre del grupo institucional (requerido).</summary>
    public string Nombre { get; set; } = string.Empty;
}