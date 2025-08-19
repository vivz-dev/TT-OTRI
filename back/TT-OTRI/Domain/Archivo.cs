namespace TT_OTRI.Domain;

public sealed class Archivo
{
    public int Id { get; set; }                 // IDOTRITTARCHIVO
    public int? Tamano { get; set; }            // TAMANIO
    public int? IdTEntidad { get; set; }        // IDTENTIDAD
    public string? Nombre { get; set; }         // NOMBRE
    public string? Formato { get; set; }        // FORMATO
    public string? Url { get; set; }            // URL
    public DateTime? FechaCreacion { get; set; } // FECHACREACION
    public DateTime? UltimoCambio { get; set; }  // ULTIMO_CAMBIO
}