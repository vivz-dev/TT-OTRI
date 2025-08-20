// ============================================================================
// Application/DTOs/TipoTransferTecnologicaDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class TipoTransferTTReadDto
{
    public int      Id        { get; set; }
    public string   Nombre    { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class TipoTransferTTCreateDto
{
    /// <summary>Nombre descriptivo (máx 100 code units UTF-16).</summary>
    public string Nombre { get; set; } = string.Empty;
}

public sealed class TipoTransferTTPatchDto
{
    /// <summary>Nombre descriptivo (máx 100 code units UTF-16). Opcional.</summary>
    public string? Nombre { get; set; }
}