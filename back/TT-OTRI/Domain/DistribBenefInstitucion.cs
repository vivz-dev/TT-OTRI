// ============================================================================
// Domain/DistribBenefInstitucion.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class DistribBenefInstitucion
{
    public int     IdDistribBenefInstitucion { get; set; }  // IDOTRITTDISTRIBBENEFINSTITUCION
    public int     IdDistribucionResolucion  { get; set; }  // IDOTRITTDISTRIBUCIONRESOLUCION
    public int     IdBenefInstitucion        { get; set; }  // IDOTRITTBENEFINSTITUCION
    public int?    IdUsuarioCrea             { get; set; }  // IDUSUARIOCREA
    public int?    IdUsuarioMod              { get; set; }  // IDUSUARIOMOD
    public decimal Porcentaje                { get; set; }  // PORCENTAJE
    public DateTime? FechaCreacion           { get; set; }  // FECHACREACION
    public DateTime? FechaModifica           { get; set; }  // FECHAMODIFICA
    public DateTime? UltimoCambio            { get; set; }  // ULTIMO_CAMBIO
}