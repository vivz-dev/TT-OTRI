// ============================================================================
// File: Application/DTOs/ResolutionCreateDto.cs
// DTO para peticiones POST (crear resolución). Excluye campos calculados
// como Id, CreatedAt y UpdatedAt; el backend los completa.
// ============================================================================

using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

/// <summary>
/// DTO de creación para <c>Resolution</c>. Contiene los campos requeridos
/// para registrar una nueva resolución mediante una operación POST.
/// </summary>
public class ResolutionCreateDto
{
    /// <summary>
    /// Id del usuario responsable del registro (FK).
    /// </summary>
    public int      IdUsuario       { get; set; }

    /// <summary>
    /// Código administrativo de la resolución (ej. "24-07-228").
    /// </summary>
    public string   Codigo          { get; set; } = string.Empty;

    /// <summary>
    /// Título de la resolución.
    /// </summary>
    public string   Titulo          { get; set; } = string.Empty;

    /// <summary>
    /// Descripción o contenido de la resolución.
    /// </summary>
    public string   Descripcion     { get; set; } = string.Empty;

    /// <summary>
    /// Fecha de emisión o aprobación.
    /// </summary>
    public DateTime? FechaResolucion { get; set; }

    /// <summary>
    /// Fecha de vigencia (hasta cuándo aplica).
    /// </summary>
    public DateTime? FechaVigencia   { get; set; }

    /// <summary>
    /// Indicador de completitud de datos asociados (por defecto false).
    /// </summary>
    public bool     Completed       { get; set; } = false;  // <- NUEVO
}