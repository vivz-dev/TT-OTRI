// ============================================================================
// File: Domain/Role.cs
// Entidad de dominio de la tabla SOTRI.T_OTRI_TT_ROL (roles del sistema).
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Representa un rol del sistema (Administrador, Gestor OTRI, etc.).
/// </summary>
public class Role
{
    /// <summary>PK. Mapea a IDOTRTTROL.</summary>
    public int Id { get; set; } // IDOTRTTROL

    /// <summary>Nombre del rol (ej.: "Administrador del sistema").</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}