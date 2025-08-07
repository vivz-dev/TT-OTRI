// -----------------------------------------------------------------------------
// File: Domain/DistributionResolution.cs
// Entidad de dominio que representa un registro de distribución monetaria
// asociado a una resolución (FK ResolutionId).
// -----------------------------------------------------------------------------
namespace TT_OTRI.Domain;

public class DistributionResolution
{
    // Identidad y relaciones
    public int Id  { get; set; }              // IDOTRIDISTRIBUCIONRESOLUCION
    public int ResolutionId { get; set; }     // IDOTRIRESOLUCION (FK)

    // Rangos y porcentajes
    public decimal MontoMaximo          { get; set; }
    public decimal MontoMinimo          { get; set; }
    public decimal PorcSubtotalAutores  { get; set; }  // 0–1
    public decimal PorcSubtotalInstitut { get; set; }  // 0–1

    // Metadatos
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}