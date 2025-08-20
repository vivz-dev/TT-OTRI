// ============================================================================
// Domain/Factura.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Factura
{
    public int       IdFactura        { get; set; } // IDOTRITTFACTURA (IDENTITY)
    public int       IdRegistroPago   { get; set; } // IDOTRITTREGISTROPAGO (FK)
    public decimal   Monto            { get; set; } // MONTO (DEC(12,2))
    public DateTime  FechaFactura     { get; set; } // FECHAFACTURA (DATE)
    public DateTime  CreatedAt        { get; set; } // FECHACREACION (TS)
    public DateTime  UpdatedAt        { get; set; } // ULTIMO_CAMBIO (TS)
}
