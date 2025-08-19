namespace TT_OTRI.Domain;

public sealed class TipoProteccion
{
    public int Id { get; set; }                   // IDOTRITTTIPOPROTECCION
    public string Nombre { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }        // FECHACREACION
    public DateTime UpdatedAt { get; set; }        // ULTIMO_CAMBIO
}