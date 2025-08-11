// ============================================================================
// File: Domain/DistributionResolution.cs
// Entidad de dominio que representa un registro de distribución monetaria
// asociado a una resolución (FK ResolutionId). Modela tramos de monto y los
// porcentajes de reparto entre autores e institución.
// Nota: si usas EF Core, mapear a la tabla correspondiente, por ejemplo:
//   builder.ToTable("T_OTRI_TT_DISTRIBUCION_RESOLUCION")
// ============================================================================

namespace TT_OTRI.Domain;

/// <summary>
/// Representa una regla de distribución económica ligada a una resolución.
/// Define un tramo por rango de montos y los porcentajes de reparto para
/// autores e institución, además de metadatos de auditoría.
/// </summary>
public class DistributionResolution
{
    // ─────────────────────────── Identidad y relaciones ───────────────────────────

    /// <summary>
    /// Identificador primario del registro.
    /// Mapea a <c>IDOTRIDISTRIBUCIONRESOLUCION</c>.
    /// </summary>
    public int Id  { get; set; }              // IDOTRIDISTRIBUCIONRESOLUCION

    /// <summary>
    /// Identificador de la resolución a la que pertenece esta distribución.
    /// Mapea a <c>IDOTRIRESOLUCION</c> (FK).
    /// </summary>
    public int ResolutionId { get; set; }     // IDOTRIRESOLUCION (FK)

    // ───────────────────────────── Tramo y porcentajes ────────────────────────────

    /// <summary>
    /// Límite máximo del tramo de monto al que aplica esta regla.
    /// </summary>
    public decimal MontoMaximo { get; set; }

    /// <summary>
    /// Límite mínimo del tramo de monto al que aplica esta regla.
    /// </summary>
    public decimal MontoMinimo { get; set; }

    /// <summary>
    /// Porcentaje del subtotal asignado a autores en el tramo (0–1).
    /// </summary>
    public decimal PorcSubtotalAutores { get; set; }  // 0–1

    /// <summary>
    /// Porcentaje del subtotal asignado a la institución en el tramo (0–1).
    /// </summary>
    public decimal PorcSubtotalInstitut { get; set; }  // 0–1

    // ───────────────────────────────── Metadatos ──────────────────────────────────

    /// <summary>
    /// Marca de tiempo de creación del registro (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Marca de tiempo de última actualización del registro (UTC).
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
