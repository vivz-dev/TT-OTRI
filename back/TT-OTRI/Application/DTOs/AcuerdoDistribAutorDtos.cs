namespace TT_OTRI.Application.DTOs;

public sealed class AcuerdoDistribAutorReadDto
{
    public int Id { get; set; } // IDOTRITTACUERDODISTRIBAUTORES
    public int IdTecnologia { get; set; } // IDOTRITTTECNOLOGIA
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class AcuerdoDistribAutorCreateDto
{
    public int IdTecnologia { get; set; }
}

public sealed class AcuerdoDistribAutorPatchDto
{
    public int? IdTecnologia { get; set; }
}