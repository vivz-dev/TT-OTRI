// ============================================================================
// File: Domain/Technology.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_TECNOLOGIA.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Estado de una tecnología: 'D' Disponible, 'N' No disponible.
/// </summary>
public enum TechnologyStatus
{
    /// <summary>Disponible ('D').</summary>
    Disponible   = 'D',
    /// <summary>No disponible ('N').</summary>
    NoDisponible = 'N'
}

/// <summary>
/// Modelo de tecnología/know-how.
/// </summary>
public class Technology
{
    /// <summary>PK. Mapea a IDOTRTTTECNOLOGIA.</summary>
    public int Id { get; set; }

    /// <summary>FK usuario ESPOL. Mapea a IDUSUARIO.</summary>
    public int IdUsuario { get; set; }

    /// <summary>Título de la tecnología. Mapea a TITULO.</summary>
    public string Titulo { get; set; } = string.Empty;

    /// <summary>Descripción de la tecnología. Mapea a DESCRIPCION.</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Estado ('D' / 'N'). Mapea a ESTADO.</summary>
    public TechnologyStatus Estado { get; set; } = TechnologyStatus.Disponible;

    /// <summary>Si la información está completa. Mapea a COMPLETED.</summary>
    public bool Completed { get; set; } = false;

    /// <summary>Si tiene acuerdo de cotitularidad. Mapea a COTITULARIDAD.</summary>
    public bool Cotitularidad { get; set; } = false;

    /// <summary>Fecha de creación (UTC). Mapea a CREATED_AT.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC). Mapea a UPDATED_AT.</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}