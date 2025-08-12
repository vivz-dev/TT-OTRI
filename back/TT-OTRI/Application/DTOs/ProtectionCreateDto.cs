// ============================================================================
// File: Application/DTOs/ProtectionCreateDto.cs
// DTO para crear una protección (POST).
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class ProtectionCreateDto
{
    /// <summary>FK tecnología (requerido).</summary>
    public int TechnologyId { get; set; }

    /// <summary>FK tipo de protección (requerido).</summary>
    public int TipoProteccionId { get; set; }

    /// <summary>Fecha de concesión/solicitud (opcional).</summary>
    public DateTime? FechaConcesionSolicitud { get; set; }
}