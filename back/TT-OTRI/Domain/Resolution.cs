// ============================================================================
// File: Domain/Resolution.cs
// Define la entidad de dominio “Resolution”, representación 1-a-1 de la
// tabla T_OTRI_TT_RESOLUCION.  Incluye propiedades, enum de estado y
// marcas de tiempo.
//
// NOTA: Mapear con EF Core => builder.ToTable("T_OTRI_TT_RESOLUCION")
// ============================================================================
using System.Text.Json.Serialization;

namespace TT_OTRI.Domain;


/// <summary>
/// Estado de una resolución.
/// Se almacena como <c>char</c> en DB2: 'V' = Vigente, 'D' = Derogada.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResolutionStatus
{
    /// <summary>Resolución vigente ('V').</summary>
    Vigente = 'V',

    /// <summary>Resolución derogada ('D').</summary>
    Derogada = 'D'
}

/// <summary>
/// Entidad de dominio que modela la tabla <c>T_OTRI_TT_RESOLUCION</c>.
/// Contiene datos descriptivos, estado, vigencia y metadatos de auditoría.
/// </summary>
public class Resolution
{
    // ─────────────────────────── Identidad y relaciones ───────────────────────────

    /// <summary>
    /// Identificador interno de la resolución.
    /// Mapea a la columna <c>IDOTRIRESOLUCION</c>.
    /// </summary>
    public int Id { get; set; }                  // IDOTRIRESOLUCION

    /// <summary>
    /// Identificador del usuario (FK) que registra/gestiona la resolución.
    /// Mapea a la columna <c>IDUSUARIO</c>.
    /// </summary>
    public int IdUsuario { get; set; }           // FK → usuario ESPOL

    // ───────────────────────────── Campos descriptivos ─────────────────────────────

    /// <summary>
    /// Código interno/administrativo de la resolución (ej. "24-07-228").
    /// </summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// Título de la resolución.
    /// </summary>
    public string Titulo { get; set; } = string.Empty;

    /// <summary>
    /// Descripción detallada del contenido/alcance de la resolución.
    /// </summary>
    public string Descripcion { get; set; } = string.Empty;

    // ───────────────────────────── Estado y fechas ─────────────────────────────

    /// <summary>
    /// Estado actual de la resolución. Por defecto, <see cref="ResolutionStatus.Vigente"/>.
    /// </summary>
    public ResolutionStatus Estado { get; set; } = ResolutionStatus.Vigente;

    /// <summary>
    /// Fecha de emisión o aprobación de la resolución.
    /// </summary>
    public DateTime FechaResolucion { get; set; }

    /// <summary>
    /// Fecha hasta la cual la resolución se considera vigente (si aplica).
    /// </summary>
    public DateTime FechaVigencia { get; set; }

    // ───────────────────────────────── Metadatos ─────────────────────────────────

    /// <summary>
    /// Indicador de completitud de los datos asociados a la resolución
    /// (útil para flujos de registro/integridad de información).
    /// </summary>
    public bool Completed { get; set; } = false;

    /// <summary>
    /// Marca de tiempo de creación del registro (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Marca de tiempo de última actualización del registro (UTC).
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
