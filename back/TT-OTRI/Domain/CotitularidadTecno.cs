namespace TT_OTRI.Domain;

public sealed class CotitularidadTecno
{
    public int Id { get; set; }                       // IDOTRITTCOTITULARIDADTECNO
    public int IdTecnologia { get; set; }             // IDOTRITTTECNOLOGIA
    public DateTime CreatedAt { get; set; }            // FECHACREACION
    public DateTime UpdatedAt { get; set; }            // ULTIMO_CAMBIO
}