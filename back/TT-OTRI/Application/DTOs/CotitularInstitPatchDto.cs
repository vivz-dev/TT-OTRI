// ============================================================================
// File: Application/DTOs/CotitularInstitPatchDto.cs
// DTO para actualización parcial (PATCH) de un cotitular institucional.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public class CotitularInstitPatchDto
{
    /// <summary>(Opcional) Nuevo nombre.</summary>
    public string? Nombre { get; set; }

    /// <summary>(Opcional) Nuevo correo.</summary>
    public string? Correo { get; set; }

    /// <summary>(Opcional) Nuevo RUC.</summary>
    public string? Ruc { get; set; }
}