namespace TT_OTRI.Domain;

public sealed class Proteccion
{
    public int Id { get; set; }                  // IDOTRITTPROTECCION
    public int IdTecnologia { get; set; }        // IDOTRITTTECNOLOGIA
    public short IdTipoProteccion { get; set; }  // IDOTRITTTIPOPROTECCION
    public DateTime? FechaSolicitud { get; set; }// FECHASOLICITUD
    public DateTime CreatedAt { get; set; }      // FECHACREACION
    public DateTime UpdatedAt { get; set; }      // ULTIMO_CAMBIO
}