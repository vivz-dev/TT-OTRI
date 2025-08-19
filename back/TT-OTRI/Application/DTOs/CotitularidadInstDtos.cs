namespace TT_OTRI.Application.DTOs;

public sealed class CotitularidadInstReadDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string Ruc { get; set; } = null!;
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class CotitularidadInstCreateDto
{
    public string Nombre { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string Ruc { get; set; } = null!;
}

public sealed class CotitularidadInstPatchDto
{
    public string? Nombre { get; set; }
    public string? Correo { get; set; }
    public string? Ruc { get; set; }
}