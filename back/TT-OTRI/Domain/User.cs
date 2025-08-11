// ============================================================================
// File: Domain/User.cs
// Entidad de dominio mínima para usuarios (FK de Usuario-Rol).
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>Usuario básico del sistema (ESPOL).</summary>
public class User
{
    /// <summary>PK. Mapea a IDUSUARIO.</summary>
    public int Id { get; set; } // IDUSUARIO

    /// <summary>Nombre del usuario.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Correo institucional.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}