// ============================================================================
// File: Application/DTOs/TechnologyPatchDto.cs
// DTO para actualización parcial (PATCH) de una tecnología.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

/// <summary>
/// Propiedades opcionales para parchear una tecnología.
/// </summary>
public class TechnologyPatchDto
{
    public int?              IdUsuario      { get; set; }
    public string?           Titulo         { get; set; }
    public string?           Descripcion    { get; set; }
    public TechnologyStatus? Estado         { get; set; }
    public bool?             Completed      { get; set; }
    public bool?             Cotitularidad  { get; set; }
}