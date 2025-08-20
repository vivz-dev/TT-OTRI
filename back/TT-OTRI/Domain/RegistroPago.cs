// ============================================================================
// Domain/RegistroPago.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class RegistroPago
{
    public int      IdRegistroPago        { get; set; }   // IDOTRITTREGISTROPAGO
    public int      IdTransferTecnologica { get; set; }   // IDOTRITTTRANSFERTECNOLOGICA
    public int      IdPersona             { get; set; }   // IDPERSONA
    public decimal  TotalPago             { get; set; }   // TOTALPAGO DEC(12,2) acumulado
    public bool     Completado            { get; set; }   // COMPLETADO SMALLINT (0/1)
    public DateTime CreatedAt             { get; set; }   // FECHACREACION TIMESTAMP
    public DateTime UpdatedAt             { get; set; }   // ULTIMO_CAMBIO TIMESTAMP
}
