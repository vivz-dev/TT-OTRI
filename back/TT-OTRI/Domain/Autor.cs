// ============================================================================
// Domain/Autor.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Autor
{
    public int IdOtriTtAutor { get; set; }                // IDOTRITTAUTOR (PK, Identity)
    public int IdOtriTtAcuerdoDistribAutores { get; set; } // IDOTRITTACUERDODISTRIBAUTORES (FK)
    public int IdUnidad { get; set; }                     // IDUNIDAD (FK)
    public int IdPersona { get; set; }                    // IDPERSONA (FK)
    public decimal? PorcAutor { get; set; }               // PORCAUTOR
    public decimal? PorcUnidad { get; set; }              // PORCUNIDAD
    public DateTime FechaCreacion { get; set; }           // FECHACREACION
    public DateTime UltimoCambio { get; set; }            // ULTIMO_CAMBIO
}