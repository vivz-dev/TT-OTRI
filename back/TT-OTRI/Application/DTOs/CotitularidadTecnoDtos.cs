namespace TT_OTRI.Application.DTOs;

public sealed class CotitularidadTecnoReadDto
{
    public int Id { get; set; }
    public int IdTecnologia { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class CotitularidadTecnoCreateDto
{
    public int IdTecnologia { get; set; }
}

public sealed class CotitularidadTecnoPatchDto
{
    public int? IdTecnologia { get; set; }
}