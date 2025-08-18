// ============================================================================
// Application/DTOs/DistribBenefInstitucionDtos.cs
// ============================================================================
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
    /// <summary>
    /// Opcional. Si no lo envías, el repo calculará MAX+1 de la tabla.
    /// </summary>
    public int?     IdDistribBenefInstitucion { get; set; }
    public int      IdDistribucionResolucion  { get; set; }
    public int      IdBenefInstitucion        { get; set; }
    public decimal  Porcentaje                { get; set; }
    public int?     IdUsuarioCrea             { get; set; }
}

public sealed class DistribBenefInstitucionPatchDto
{
    public int?     IdDistribucionResolucion  { get; set; }
    public int?     IdBenefInstitucion        { get; set; }
    public decimal? Porcentaje                { get; set; }
    public int?     IdUsuarioMod              { get; set; }
}