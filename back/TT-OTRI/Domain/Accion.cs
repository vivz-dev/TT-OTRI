// ============================================================================
// File: Domain/Accion.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_ACCION (acciones del sistema).
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Acción disponible en el sistema (ej.: Resoluciones, Tecnologias/know-how, TT, etc.).
/// </summary>
public class Accion
{
    /// <summary>PK. Mapea a IDOTRTTACCION.</summary>
    public int Id { get; set; } // IDOTRTTACCION

    /// <summary>Nombre de la acción.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}