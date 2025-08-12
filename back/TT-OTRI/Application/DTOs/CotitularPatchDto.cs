// ============================================================================
// File: Application/DTOs/CotitularPatchDto.cs
// DTO para actualización parcial (PATCH) de un cotitular.
// ============================================================================
namespace TT_OTRI.Application.DTOs;

/// <summary>
/// Campos opcionales para modificar un cotitular existente.
/// </summary>
public class CotitularPatchDto
{
    public int?    CotitularidadId     { get; set; }
    public int?    CotitularInstitId   { get; set; }
    public int?    IdUsuario           { get; set; }
    public decimal? PorcCotitularidad  { get; set; }
}