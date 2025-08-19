namespace TT_OTRI.Application.DTOs;

// PATCH parcial: todas opcionales
public sealed class UpdateArchivoDto
{
    public int? Tamano { get; set; }
    public int? IdTEntidad { get; set; }
    public string? Nombre { get; set; }
    public string? Formato { get; set; }
    public string? Url { get; set; }
}