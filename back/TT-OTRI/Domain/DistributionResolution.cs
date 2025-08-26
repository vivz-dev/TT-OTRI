// ============================================================================
// Domain/DistribucionResolucion.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class DistribucionResolucion
{
    public int IdDistribucionResolucion { get; set; }      // IDOTRITTDISTRIBUCIONRESOLUCION
    public int IdResolucion { get; set; }                  // IDOTRITTRESOLUCION

    public decimal? MontoMaximo { get; set; }               // MONTOMAXIMO
    public decimal MontoMinimo { get; set; }               // MONTOMINIMO
    public decimal PorcSubtotalAutores { get; set; }       // PORCSUBTOTALAUTORES
    public decimal PorcSubtotalInstitut { get; set; }      // PORCSUBTOTALINSTITUT

    public int? IdUsuarioCrea { get; set; }                // IDUSUARIOCREA
    public int? IdUsuarioMod { get; set; }                 // IDUSUARIOMOD
    public DateTime? FechaCreacion { get; set; }           // FECHACREACION
    public DateTime? FechaModifica { get; set; }           // FECHAMODIFICA
    public DateTime? UltimoCambio { get; set; }            // ULTIMO_CAMBIO
}