// TT-OTRI/Application/DTOs/RegaliaDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class RegaliaReadDto
{
    public int Id { get; set; }
    public int IdTransferenciaTecnologica { get; set; }
    public int? CantidadUnidad { get; set; }
    public decimal? CantidadPorcentaje { get; set; }
    public bool EsPorUnidad { get; set; }
    public bool EsPorcentaje { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class RegaliaCreateDto
{
    public int IdTransferenciaTecnologica { get; set; }
    public int? CantidadUnidad { get; set; }
    public decimal? CantidadPorcentaje { get; set; }
    public bool EsPorUnidad { get; set; }
    public bool EsPorcentaje { get; set; }
}

public sealed class RegaliaPatchDto
{
    public int? CantidadUnidad { get; set; }
    public decimal? CantidadPorcentaje { get; set; }
    public bool? EsPorUnidad { get; set; }
    public bool? EsPorcentaje { get; set; }
}