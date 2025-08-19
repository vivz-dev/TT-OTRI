// Application/DTOs/DistribBenefInstitucionDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class DistribBenefInstitucionReadDto
{
    public int      IdDistribBenefInstitucion { get; set; }
    public int      IdDistribucionResolucion  { get; set; }
    public int      IdBenefInstitucion        { get; set; }
    public int?     IdUsuarioCrea             { get; set; }
    public int?     IdUsuarioMod              { get; set; }
    public decimal  Porcentaje                { get; set; }
    public DateTime? FechaCreacion            { get; set; }
    public DateTime? FechaModifica            { get; set; }
    public DateTime? UltimoCambio             { get; set; }
}

public sealed class DistribBenefInstitucionCreateDto
{
    public int?     IdDistribBenefInstitucion { get; set; } // PK si gestionas MAX+1
    public int      IdDistribucionResolucion  { get; set; } // NOT NULL
    public int      IdBenefInstitucion        { get; set; } // NOT NULL
    public decimal  Porcentaje                { get; set; } // NOT NULL en lógica (DB permite null pero normalizamos)
    public int      IdUsuarioCrea             { get; set; } // NOT NULL en DB → requerido aquí
}

public sealed class DistribBenefInstitucionPatchDto
{
    public int?     IdDistribucionResolucion  { get; set; }
    public int?     IdBenefInstitucion        { get; set; }
    public decimal? Porcentaje                { get; set; }
    public int?     IdUsuarioMod              { get; set; }
}