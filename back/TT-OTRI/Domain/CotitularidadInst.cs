// Domain/CotitularidadInst.cs
namespace TT_OTRI.Domain;

public sealed class CotitularidadInst
{
    public int Id { get; set; }                     // IDOTRITTCOTITULARINST
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Ruc { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}