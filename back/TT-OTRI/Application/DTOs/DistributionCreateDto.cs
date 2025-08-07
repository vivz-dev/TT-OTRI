// -----------------------------------------------------------------------------
// File: Application/DTOs/DistributionCreateDto.cs
// Campos requeridos para crear una nueva distribución.
// -----------------------------------------------------------------------------
namespace TT_OTRI.Application.DTOs;

public class DistributionCreateDto
{
    public int     ResolutionId         { get; set; }
    public decimal MontoMaximo          { get; set; }
    public decimal MontoMinimo          { get; set; }
    public decimal PorcSubtotalAutores  { get; set; }
    public decimal PorcSubtotalInstitut { get; set; }
}