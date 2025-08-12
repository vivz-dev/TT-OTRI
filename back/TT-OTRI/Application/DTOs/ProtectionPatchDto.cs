// ============================================================================
// File: Application/DTOs/ProtectionPatchDto.cs
// DTO para actualización parcial (PATCH) de una protección.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class ProtectionPatchDto
{
    public int?      TechnologyId            { get; set; }
    public int?      TipoProteccionId        { get; set; }
    public DateTime? FechaConcesionSolicitud { get; set; }
}