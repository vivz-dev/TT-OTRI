// ============================================================================
// File: Domain/UserRole.cs
// Entidad que modela la relación Usuario–Rol (T_OTRI_TT_USUARIO_ROL).
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Relación de asignación de roles a usuarios.
/// </summary>
public class UserRole
{
    /// <summary>PK. Mapea a IDOTRTTUSUARIOROL.</summary>
    public int Id { get; set; } // IDOTRTTUSUARIOROL

    /// <summary>FK a usuario. Mapea a IDUSUARIO.</summary>
    public int UsuarioId { get; set; }

    /// <summary>FK a rol. Mapea a IDOTRTTROL.</summary>
    public int RoleId { get; set; }

    /// <summary>Fecha creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}