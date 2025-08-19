namespace TT_OTRI.Application.DTOs;

public sealed class TipoProteccionReadDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class TipoProteccionCreateDto
{
    public string Nombre { get; set; } = string.Empty;
}

public sealed class TipoProteccionPatchDto
{
    public string? Nombre { get; set; }
}