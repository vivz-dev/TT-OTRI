// ============================================================================
// File: Domain/Cotitular.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_COTITULAR.
// ============================================================================
namespace TT_OTRI.Domain;

/// <summary>
/// Cotitular (institución participante) dentro de un acuerdo de cotitularidad.
/// </summary>
public class Cotitular
{
    /// <summary>PK. Mapea a IDOTRTTCOTITULAR.</summary>
    public int Id { get; set; }

    /// <summary>FK a SOTRI.T_OTRI_TT_COTITULARIDAD (IDOTRTTCOTITULARIDAD).</summary>
    public int CotitularidadId { get; set; }

    /// <summary>FK a SOTRI.T_OTRI_TT_COTITULARINSTIT (IDOTRTTCOTITULARINSTIT).</summary>
    public int CotitularInstitId { get; set; }

    /// <summary>FK a usuario ESPOL (IDUSUARIO).</summary>
    public int IdUsuario { get; set; }

    /// <summary>Porcentaje referencial asignado al cotitular (0–1).</summary>
    public decimal PorcCotitularidad { get; set; }

    /// <summary>Fecha de creación (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC).</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}