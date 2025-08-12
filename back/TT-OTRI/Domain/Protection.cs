// ============================================================================
// File: Domain/Protection.cs
// Entidad de dominio para la tabla SOTRI.T_OTRI_TT_PROTECCION.
// Relaciona una Tecnología con un Tipo de Protección y guarda la fecha
// de concesión/solicitud más auditoría (created/updated).
// ============================================================================
namespace TT_OTRI.Domain;

public class Protection
{
    /// <summary>PK. Mapea a IDOTRTTPROTECCION.</summary>
    public int Id { get; set; }

    /// <summary>FK tecnología. Mapea a IDOTRTTTECNOLOGIA.</summary>
    public int TechnologyId { get; set; }

    /// <summary>FK tipo de protección. Mapea a IDOTRTTTIPOPROTECCION.</summary>
    public int TipoProteccionId { get; set; }

    /// <summary>Fecha de concesión o de solicitud (opcional). Mapea a FECHA_CONCESION_SOLICITUD.</summary>
    public DateTime? FechaConcesionSolicitud { get; set; }

    /// <summary>Fecha de creación (UTC). Mapea a CREATED_AT.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Fecha de última actualización (UTC). Mapea a UPDATED_AT.</summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}