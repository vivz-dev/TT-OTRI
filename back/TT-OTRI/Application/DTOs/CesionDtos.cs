// ============================================================================
// Application/DTOs/CesionDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class CesionReadDto
{
    public int IdOtriTtCesion { get; set; }
    public int IdOtriTtTransferTecnologica { get; set; }
    public DateTime? FechaLimite { get; set; }
    public DateTime? FechaCreacion { get; set; }
    public DateTime? UltimoCambio { get; set; }
}

public sealed class CesionCreateDto
{
    public int IdOtriTtTransferTecnologica { get; set; }
    public DateTime? FechaLimite { get; set; }
}

public sealed class CesionPatchDto
{
    public int? IdOtriTtTransferTecnologica { get; set; }
    public DateTime? FechaLimite { get; set; }
}