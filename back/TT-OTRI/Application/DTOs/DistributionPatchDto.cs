// ============================================================================
// File: Application/DTOs/DistributionPatchDto.cs
// Permite modificar cualquier valor de una distribución. Todas las propiedades
// son opcionales: solo las presentes en el JSON se aplican durante el PATCH.
// ============================================================================

namespace TT_OTRI.Application.DTOs;

/// <summary>
/// DTO para actualización parcial (PATCH) de una distribución vinculada a una
/// resolución. Cada propiedad es opcional y, de estar presente, se aplicará
/// sobre la entidad existente.
/// </summary>
public class DistributionPatchDto
{
    /// <summary>
    /// (Opcional) Nuevo Id de la resolución a la que pertenece la distribución.
    /// </summary>
    public int?     ResolutionId         { get; set; }

    /// <summary>
    /// (Opcional) Límite máximo del tramo de monto.
    /// </summary>
    public decimal? MontoMaximo          { get; set; }

    /// <summary>
    /// (Opcional) Límite mínimo del tramo de monto.
    /// </summary>
    public decimal? MontoMinimo          { get; set; }

    /// <summary>
    /// (Opcional) Porcentaje del subtotal asignado a autores (0–1).
    /// </summary>
    public decimal? PorcSubtotalAutores  { get; set; }

    /// <summary>
    /// (Opcional) Porcentaje del subtotal asignado a la institución (0–1).
    /// </summary>
    public decimal? PorcSubtotalInstitut { get; set; }
}