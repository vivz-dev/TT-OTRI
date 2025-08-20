// Application/DTOs/DistribPagoDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class DistribPagoReadDto
{
    public int Id { get; set; }
    public int IdFactura { get; set; }
    public int IdTipoTransferencia { get; set; }
    public int IdAutor { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal MontoAutor { get; set; }
    public decimal MontoCentro { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class DistribPagoCreateDto
{
    public int IdFactura { get; set; }
    public int IdTipoTransferencia { get; set; }
    public int IdAutor { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal MontoAutor { get; set; }
    public decimal MontoCentro { get; set; }
}

public sealed class DistribPagoPatchDto
{
    public int? IdFactura { get; set; }
    public int? IdTipoTransferencia { get; set; }
    public int? IdAutor { get; set; }
    public decimal? MontoTotal { get; set; }
    public decimal? MontoAutor { get; set; }
    public decimal? MontoCentro { get; set; }
}