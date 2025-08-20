// ============================================================================
// Application/DTOs/EspecialistaDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class EspecialistaReadDto
{
    public int IdOtriTtEspecialista { get; set; }
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
    public string? Identificacion { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string Tipo { get; set; } = "ADC";
    public DateTime? FechaCreacion { get; set; }
    public DateTime? UltimoCambio { get; set; }
}

public sealed class EspecialistaCreateDto
{
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
    public string? Identificacion { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string Tipo { get; set; } = "ADC";
}

public sealed class EspecialistaPatchDto
{
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
    public string? Identificacion { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string? Tipo { get; set; }
}