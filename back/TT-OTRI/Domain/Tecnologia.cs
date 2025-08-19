namespace TT_OTRI.Domain;

public sealed class Tecnologia
{
    public int Id { get; set; }                     // IDOTRITTTECNOLOGIA
    public int IdPersona { get; set; }              // IDPERSONA
    public bool Completado { get; set; }            // COMPLETADO (mapeado a bool)
    public bool Cotitularidad { get; set; }         // COTITULARIDAD (mapeado a bool)
    public string Titulo { get; set; } = null!;     // TITULO (VARGRAPHIC)
    public string Descripcion { get; set; } = null!; // DESCRIPCION (VARGRAPHIC)
    public char Estado { get; set; }                // ESTADO (CHAR)
    public DateTime FechaCreacion { get; set; }     // FECHACREACION
    public DateTime UltimoCambio { get; set; }      // ULTIMO_CAMBIO
}