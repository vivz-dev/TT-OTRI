// ============================================================================
// File: Application/DTOs/ResolutionPatchDto.cs
// Permite modificar CUALQUIER atributo de la resolución. Todas las propiedades
// son opcionales: solo las presentes en el JSON se aplican durante el PATCH.
// ============================================================================

using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

/// <summary>
/// DTO para actualización parcial (PATCH) de <c>Resolution</c>.
/// Cada propiedad es opcional; únicamente las provistas en el cuerpo de la
/// solicitud se aplicarán sobre la entidad existente.
/// </summary>
public class ResolutionPatchDto
{
    /// <summary>
    /// (Opcional) Nuevo Id del usuario asociado.
    /// </summary>
    public int?              IdUsuario       { get; set; }

    /// <summary>
    /// (Opcional) Código administrativo de la resolución.
    /// </summary>
    public string?           Codigo          { get; set; }

    /// <summary>
    /// (Opcional) Título de la resolución.
    /// </summary>
    public string?           Titulo          { get; set; }

    /// <summary>
    /// (Opcional) Descripción o contenido de la resolución.
    /// </summary>
    public string?           Descripcion     { get; set; }

    /// <summary>
    /// (Opcional) Estado de la resolución (Vigente/Derogada).
    /// </summary>
    public ResolutionStatus? Estado          { get; set; }

    /// <summary>
    /// (Opcional) Fecha de emisión o aprobación.
    /// </summary>
    public DateTime?         FechaResolucion { get; set; }

    /// <summary>
    /// (Opcional) Fecha de vigencia (hasta cuándo aplica).
    /// </summary>
    public DateTime?         FechaVigencia   { get; set; }

    /// <summary>
    /// (Opcional) Indicador de completitud de datos asociados.
    /// </summary>
    public bool?             Completed       { get; set; }
}