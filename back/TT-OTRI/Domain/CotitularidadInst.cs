namespace TT_OTRI.Domain;

public sealed class CotitularidadInst
{
    public int Id { get; set; }             // IDOTRITTCOTITULARINST
    public string Nombre { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string Ruc { get; set; } = null!;
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}