namespace TT_OTRI.Application.DTOs;

public sealed class CotitularReadDto
{
    public int Id { get; set; }
    public int IdCotitularidadTecno { get; set; }
    public int IdCotitularidadInst { get; set; }
    public int IdPersona { get; set; }
    public decimal Porcentaje { get; set; } // 0..1 (DECIMAL(3,2) en DB)
    public bool PerteneceEspol { get; set; } // SMALLINT(1/0)
    public string? Nombre { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class CotitularCreateDto
{
    public int IdCotitularidadTecno { get; set; }
    public int IdCotitularidadInst { get; set; }
    public int IdPersona { get; set; }
    public decimal Porcentaje { get; set; } // 0..1
    public bool PerteneceEspol { get; set; } // true => 1, false => 0
    public string? Nombre { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
}

public sealed class CotitularPatchDto
{
    public int? IdCotitularidadTecno { get; set; }
    public int? IdCotitularidadInst { get; set; }
    public int? IdPersona { get; set; }
    public decimal? Porcentaje { get; set; }
    public bool? PerteneceEspol { get; set; }
    public string? Nombre { get; set; }
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
}
