namespace TT_OTRI.Application.DTOs;

public sealed class TecnologiaReadDto
{
    public int Id { get; set; }
    public int IdPersona { get; set; }
    public bool Completado { get; set; }
    public bool Cotitularidad { get; set; }
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public char Estado { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class TecnologiaCreateDto
{
    public int IdPersona { get; set; }
    public bool Completado { get; set; }
    public bool Cotitularidad { get; set; }
    public required string Titulo { get; set; }
    public required string Descripcion { get; set; }
    public required char Estado { get; set; }
}

public sealed class TecnologiaPatchDto
{
    public int? IdPersona { get; set; }
    public bool? Completado { get; set; }
    public bool? Cotitularidad { get; set; }
    public string? Titulo { get; set; }
    public string? Descripcion { get; set; }
    public char? Estado { get; set; }
}