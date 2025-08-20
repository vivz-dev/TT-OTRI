// TT-OTRI/Domain/Regalia.cs
namespace TT_OTRI.Domain;

public sealed class Regalia
{
    public int Id { get; set; }                            // IDOTRITTREGALIAS
    public int IdTransferenciaTecnologica { get; set; }    // IDOTRITTTRANSFERTECNOLOGICA
    public int? CantidadUnidad { get; set; }               // CANTIDADUNIDAD
    public decimal? CantidadPorcentaje { get; set; }       // CANTIDADPORCENTAJE (0-1)
    public bool EsPorUnidad { get; set; }                  // ESPORUNIDAD
    public bool EsPorcentaje { get; set; }                 // ESPORCENTAJE
    public DateTime FechaCreacion { get; set; }            // FECHACREACION
    public DateTime UltimoCambio { get; set; }             // ULTIMO_CAMBIO
}