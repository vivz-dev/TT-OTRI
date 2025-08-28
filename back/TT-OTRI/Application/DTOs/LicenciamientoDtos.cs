// ============================================================================
// Application/DTOs/LicenciamientoDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class LicenciamientoReadDto
{
    public int Id { get; set; }
    public int IdTransferTecnologica { get; set; }
    public bool SubLicenciamiento { get; set; }
    public bool LicenciaExclusiva { get; set; }
    public DateTime? FechaLimite { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class LicenciamientoCreateDto
{
    public int IdTransferTecnologica { get; set; }
    public bool SubLicenciamiento { get; set; }
    public bool LicenciaExclusiva { get; set; } = false;
    public DateTime? FechaLimite { get; set; }
}

public sealed class LicenciamientoPatchDto
{
    public int? IdTransferTecnologica { get; set; }
    public bool? SubLicenciamiento { get; set; }
    public bool? LicenciaExclusiva { get; set; }
    public DateTime? FechaLimite { get; set; }
}