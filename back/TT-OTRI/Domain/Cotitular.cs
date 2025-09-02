namespace TT_OTRI.Domain;

public sealed class Cotitular
{
    public int Id { get; set; }                     // IDOTRITTCOTITULAR
    public int IdCotitularidadTecno { get; set; }   // IDOTRITTCOTITULARIDADTECNO
    public int IdCotitularidadInst { get; set; }    // IDOTRITTCOTITULARINST
    public int IdPersona { get; set; }              // IDPERSONA
    public decimal Porcentaje { get; set; }         // PORCCOTITULARIDAD (0..1)
    public bool PerteneceEspol { get; set; }        // PERTENECEESPOL (SMALLINT 1/0)
    public string? Nombre { get; set; }             // NOMBRE (VARGRAPHIC(100))
    public string? Correo { get; set; }             // CORREO (VARGRAPHIC(100))
    public string? Telefono { get; set; }           // TELEFONO (VARGRAPHIC(100))
    public DateTime FechaCreacion { get; set; }     // FECHACREACION
    public DateTime UltimoCambio { get; set; }      // ULTIMO_CAMBIO
}