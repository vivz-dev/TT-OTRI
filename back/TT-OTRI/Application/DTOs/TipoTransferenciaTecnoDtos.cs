// Application/DTOs/TipoTransferenciaTecnoDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class TipoTransferenciaTecnoReadDto
{
    public int Id { get; set; }
    public int IdTransferenciaTecnologica { get; set; }
    public int IdTipoTransferenciaTecnologica { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime UltimoCambio { get; set; }
}

public sealed class TipoTransferenciaTecnoCreateDto
{
    public int IdTransferenciaTecnologica { get; set; }
    public int IdTipoTransferenciaTecnologica { get; set; }
}

public sealed class TipoTransferenciaTecnoPatchDto
{
    public int? IdTransferenciaTecnologica { get; set; }
    public int? IdTipoTransferenciaTecnologica { get; set; }
}