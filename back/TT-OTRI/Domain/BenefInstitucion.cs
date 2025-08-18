// ============================================================================
// Domain/BenefInstitucion.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class BenefInstitucion
{
    public int Id { get; set; }                     // IDOTRIBENEFINSTITUCION
    public string Nombre { get; set; } = string.Empty;
    public DateTime? FechaCreacion { get; set; }    // FECHACREACION
    public DateTime? UltimoCambio { get; set; }     // ULTIMO_CAMBIO
}