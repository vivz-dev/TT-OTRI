// ============================================================================
// Domain/Cesion.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Cesion
{
    public int IdOtriTtCesion { get; set; }                      // IDOTRITTCESION (PK, Identity)
    public int IdOtriTtTransferTecnologica { get; set; }        // IDOTRITTTRANSFERTECNOLOGICA (FK)
    public DateTime? FechaLimite { get; set; }                  // FECHALIMITE
    public DateTime? FechaCreacion { get; set; }                // FECHACREACION (Default: CURRENT TIMESTAMP)
    public DateTime? UltimoCambio { get; set; }                 // ULTIMO_CAMBIO (Default: CURRENT TIMESTAMP)
}