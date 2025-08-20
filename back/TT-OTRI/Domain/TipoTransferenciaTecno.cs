// Domain/TipoTransferenciaTecno.cs
namespace TT_OTRI.Domain;

public sealed class TipoTransferenciaTecno
{
    public int Id { get; set; }                         // IDOTRITTTIPOTRANSFERTECNO
    public int IdTransferenciaTecnologica { get; set; } // IDOTRITTTRANSFERTECNOLOGICA
    public int IdTipoTransferenciaTecnologica { get; set; } // IDOTRITTTIPOTRANSFERTECNOLOGICA
    public DateTime FechaCreacion { get; set; }         // FECHACREACION
    public DateTime UltimoCambio { get; set; }          // ULTIMO_CAMBIO
}