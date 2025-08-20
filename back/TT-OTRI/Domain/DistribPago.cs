// Domain/DistribPago.cs
namespace TT_OTRI.Domain;

public sealed class DistribPago
{
    public int Id { get; set; }                         // IDOTRITTDISTRIBPAGO
    public int IdFactura { get; set; }                  // IDOTRITTFACTURA
    public int IdTipoTransferencia { get; set; }        // IDOTRITTTIPOTRANSFERTECNOLOGICA
    public int IdAutor { get; set; }                    // IDOTRITTAUTOR
    public decimal MontoTotal { get; set; }             // MONTOTOTAL
    public decimal MontoAutor { get; set; }             // MONTOAUTOR
    public decimal MontoCentro { get; set; }            // MONTOCENTRO
    public DateTime FechaCreacion { get; set; }         // FECHACREACION
    public DateTime UltimoCambio { get; set; }          // ULTIMO_CAMBIO
}