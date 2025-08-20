// ============================================================================
// Application/DTOs/UnidadDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class UnidadReadDto
{
    public int    IdUnidad     { get; set; }
    public string NombreUnidad { get; set; } = string.Empty;
}