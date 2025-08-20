// Application/DTOs/CotitularidadInstDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class CotitularidadInstReadDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Ruc { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class CotitularidadInstCreateDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Ruc { get; set; } = string.Empty;
}

public sealed class CotitularidadInstPatchDto
{
    public string? Nombre { get; set; }
    public string? Correo { get; set; }
    public string? Ruc { get; set; }
}