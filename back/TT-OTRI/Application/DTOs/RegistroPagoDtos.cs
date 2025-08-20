// ============================================================================
// Application/DTOs/RegistroPagoDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class RegistroPagoReadDto
{
    public int      IdRegistroPago        { get; set; }
    public int      IdTransferTecnologica { get; set; }
    public int      IdPersona             { get; set; }
    public decimal  TotalPago             { get; set; }
    public bool     Completado            { get; set; }
    public DateTime CreatedAt             { get; set; }
    public DateTime UpdatedAt             { get; set; }
}

public sealed class RegistroPagoCreateDto
{
    // Id identity → NO se envía
    public int      IdTransferTecnologica { get; set; }
    public int      IdPersona             { get; set; }
    public decimal  TotalPago             { get; set; }   // si no tienes, envía 0
    public bool     Completado            { get; set; }   // 0/1 en DB
}

public sealed class RegistroPagoPatchDto
{
    public int?     IdTransferTecnologica { get; set; }
    public int?     IdPersona             { get; set; }
    public decimal? TotalPago             { get; set; }
    public bool?    Completado            { get; set; }
}