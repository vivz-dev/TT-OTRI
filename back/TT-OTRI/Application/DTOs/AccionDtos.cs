// ============================================================================
// Application/DTOs/AccionDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class AccionReadDto
{
    public int      Id { get; set; }
    public string   Nombre { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class AccionCreateDto
{
    public string Nombre { get; set; } = string.Empty;
}

public sealed class AccionPatchDto
{
    public string? Nombre { get; set; }
}