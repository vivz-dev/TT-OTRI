// -----------------------------------------------------------------------------
// File: Application/DTOs/DistributionPatchDto.cs
// Permite modificar cualquier valor de una distribución.
// -----------------------------------------------------------------------------
namespace TT_OTRI.Application.DTOs;

public class DistributionPatchDto
{
    public int?     ResolutionId         { get; set; }
    public decimal? MontoMaximo          { get; set; }
    public decimal? MontoMinimo          { get; set; }
    public decimal? PorcSubtotalAutores  { get; set; }
    public decimal? PorcSubtotalInstitut { get; set; }
}