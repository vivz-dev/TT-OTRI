namespace TT_OTRI.Application.DTOs;

public sealed class ArchivoDto
{
    public int Id { get; set; }
    public int? Tamano { get; set; }
    public int? IdTEntidad { get; set; }
    public string? Nombre { get; set; }
    public string? Formato { get; set; }
    public string? Url { get; set; }
    public DateTime? FechaCreacion { get; set; }
    public DateTime? UltimoCambio { get; set; }
}