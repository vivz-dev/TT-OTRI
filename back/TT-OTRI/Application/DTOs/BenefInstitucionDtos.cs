// ============================================================================
// Application/DTOs/BenefInstitucionDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class BenefInstitucionDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime? FechaCreacion { get; set; }
    public DateTime? UltimoCambio { get; set; }
}

public sealed class CreateBenefInstitucionDto
{
    public string Nombre { get; set; } = string.Empty;
}

public sealed class UpdateBenefInstitucionDto
{
    public string Nombre { get; set; } = string.Empty;
}