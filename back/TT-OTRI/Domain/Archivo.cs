namespace TT_OTRI.Domain;

public sealed class Archivo
{
    public int Id { get; set; }                  // IDOTRITTARCHIVO
    public int? Tamano { get; set; }             // TAMANIO
    public int? IdTEntidad { get; set; }         // IDTTENTIDAD
    public string? Nombre { get; set; }          // NOMBRE
    public string? Formato { get; set; }         // FORMATO
    public string? Url { get; set; }             // URL
    public DateTime? FechaCreacion { get; set; } // FECHACREACION
    public DateTime? UltimoCambio { get; set; }  // ULTIMO_CAMBIO

    // 🆕 Nuevo campo
    public string? TipoEntidad { get; set; }     // TIPOENTIDAD (R, T, PI, CO, D, TT, F, SP)
}