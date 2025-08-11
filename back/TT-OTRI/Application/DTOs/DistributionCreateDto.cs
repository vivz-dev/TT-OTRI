// ============================================================================
// File: Application/DTOs/DistributionCreateDto.cs
// Campos requeridos para crear una nueva distribución (operación POST).
// Excluye campos calculados como Id, CreatedAt y UpdatedAt.
// ============================================================================

namespace TT_OTRI.Application.DTOs;

/// <summary>
/// DTO de creación para una distribución económica ligada a una resolución.
/// Define el tramo (montos mínimo/máximo) y los porcentajes de reparto.
/// </summary>
public class DistributionCreateDto
{
    /// <summary>
    /// Id de la resolución (FK) a la que pertenece esta distribución.
    /// </summary>
    public int     ResolutionId         { get; set; }

    /// <summary>
    /// Límite máximo del tramo de monto al que aplica la regla.
    /// </summary>
    public decimal MontoMaximo          { get; set; }

    /// <summary>
    /// Límite mínimo del tramo de monto al que aplica la regla.
    /// </summary>
    public decimal MontoMinimo          { get; set; }

    /// <summary>
    /// Porcentaje del subtotal asignado a autores en el tramo (0–1).
    /// </summary>
    public decimal PorcSubtotalAutores  { get; set; }

    /// <summary>
    /// Porcentaje del subtotal asignado a la institución en el tramo (0–1).
    /// </summary>
    public decimal PorcSubtotalInstitut { get; set; }
}