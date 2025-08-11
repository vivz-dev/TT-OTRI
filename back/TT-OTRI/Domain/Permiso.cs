// ============================================================================
// File: Domain/Permiso.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_PERMISO (permisos por rol/acción).
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>Permisos asignados a un rol sobre una acción del sistema.</summary>
public class Permiso
{
    /// <summary>PK. Mapea a IDOTRTTPERMISO.</summary>
    public int Id { get; set; } // IDOTRTTPERMISO

    /// <summary>FK a rol. Mapea a IDOTRTTROL.</summary>
    public int RoleId { get; set; }

    /// <summary>FK a acción. Mapea a IDOTRTTACCION.</summary>
    public int AccionId { get; set; }

    /// <summary>Puede visualizar.</summary>
    public bool Visualizar { get; set; } = false;

    /// <summary>Puede editar.</summary>
    public bool Editar { get; set; } = false;

    /// <summary>Puede inhabilitar.</summary>
    public bool Inhabilitar { get; set; } = false;

    /// <summary>Puede crear.</summary>
    public bool Crear { get; set; } = false;

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}