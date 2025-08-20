// ============================================================================
// Application/DTOs/FacturaDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class FacturaReadDto
{
    public int      IdFactura       { get; set; }
    public int      IdRegistroPago  { get; set; }
    public decimal  Monto           { get; set; }
    public DateTime FechaFactura    { get; set; }
    public DateTime FechaCreacion   { get; set; }
    public DateTime UltimoCambio    { get; set; }
}

public sealed class FacturaCreateDto
{
    public int      IdRegistroPago  { get; set; }
    public decimal  Monto           { get; set; }
    public DateTime FechaFactura    { get; set; } // Sólo fecha: el repo envía DB2Type.Date
}

public sealed class FacturaPatchDto
{
    public int?      IdRegistroPago  { get; set; }
    public decimal?  Monto           { get; set; }
    public DateTime? FechaFactura    { get; set; }
}