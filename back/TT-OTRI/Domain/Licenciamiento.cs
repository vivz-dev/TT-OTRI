// ============================================================================
// Domain/Licenciamiento.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Licenciamiento
{
    public int Id { get; set; }                                    // IDOTRITTLICENCIAMIENTO
    public int IdTransferTecnologica { get; set; }                 // IDOTRITTTRANSFERTECNOLOGICA
    public bool SubLicenciamiento { get; set; }                    // SUBLICENCIAMIENTO
    public bool LicenciaExclusiva { get; set; }                    // LICENCIAEXCLUSIVA
    public DateTime? FechaLimite { get; set; }                     // FECHALIMITE
    public DateTime CreatedAt { get; set; }                        // FECHACREACION
    public DateTime UpdatedAt { get; set; }                        // ULTIMO_CAMBIO
}