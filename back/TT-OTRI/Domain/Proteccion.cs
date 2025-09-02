// Domain/Proteccion.cs
namespace TT_OTRI.Domain;

public sealed class Proteccion
{
    public int Id { get; set; }                  // IDOTRITTPROTECCION
    public int IdTecnologia { get; set; }        // IDOTRITTTECNOLOGIA
    public short IdTipoProteccion { get; set; }  // IDOTRITTTIPOPROTECCION
    public DateTime? FechaSolicitud { get; set; }// FECHASOLICITUD
    public short Concesion { get; set; }         // CONCESION (0/1)
    public short Solicitud { get; set; }         // SOLICITUD (0/1)
    public DateTime? FechaConcesion { get; set; }// FECHACONCESION
    public DateTime CreatedAt { get; set; }      // FECHACREACION
    public DateTime UpdatedAt { get; set; }      // ULTIMO_CAMBIO
}