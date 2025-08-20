namespace TT_OTRI.Domain;

public sealed class AcuerdoDistribAutor
{
    public int Id { get; set; } // IDOTRITTACUERDODISTRIBAUTORES
    public int IdTecnologia { get; set; } // IDOTRITTTECNOLOGIA
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}