// ============================================================================
// File: Domain/CotitularInstit.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_COTITULARINSTIT.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Cotitular institucional (catálogo). Puede ser vinculado a acuerdos
/// de cotitularidad mediante tablas relacionales que definas después.
/// </summary>
public class CotitularInstit
{
    /// <summary>PK. Mapea a IDOTRTTCOTITULARINSTIT.</summary>
    public int Id { get; set; }

    /// <summary>Nombre de la institución cotitular.</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Correo de contacto de la institución cotitular.</summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>RUC de la institución cotitular.</summary>
    public string Ruc { get; set; } = string.Empty;

    /// <summary>Fecha de creación (UTC). Mapea a CREATED_AT.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC). Mapea a UPDATED_AT.</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}