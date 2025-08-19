namespace TT_OTRI.Application.DTOs;

public sealed class CotitularReadDto
{
    public int Id { get; set; }
    public int IdCotitularidadTecno { get; set; }
    public int IdCotitularidadInst { get; set; }
    public int IdPersona { get; set; }
    public decimal Porcentaje { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class CotitularCreateDto
{
    public int IdCotitularidadTecno { get; set; }
    public int IdCotitularidadInst { get; set; }
    public int IdPersona { get; set; }
    public decimal Porcentaje { get; set; }
}

public sealed class CotitularPatchDto
{
    public int? IdCotitularidadTecno { get; set; }
    public int? IdCotitularidadInst { get; set; }
    public int? IdPersona { get; set; }
    public decimal? Porcentaje { get; set; }
}