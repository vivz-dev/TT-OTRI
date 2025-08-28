// ============================================================================
// Application/DTOs/TransferTecnologicaDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class TransferTecnologicaReadDto
{
    public int       Id                          { get; set; }
    public int       IdPersona                   { get; set; }
    public int       IdResolucion                { get; set; }
    public int       IdTecnologia                { get; set; }
    public int?      IdDistribucionResolucion    { get; set; } // NEW: IDOTRITTDISTRIBUCIONRESOLUCION
    public decimal?  Monto                       { get; set; }
    public bool      Pago                        { get; set; }
    public bool      Completed                   { get; set; }
    public string    Titulo                      { get; set; } = string.Empty;
    public string    Descripcion                 { get; set; } = string.Empty;
    public string    Estado                      { get; set; } = string.Empty;   // 'V' o 'F' como string
    public DateTime? FechaInicio                 { get; set; }
    public DateTime? FechaFin                    { get; set; }
    public DateTime  CreatedAt                   { get; set; }
    public DateTime  UpdatedAt                   { get; set; }
}

// Los DTOs de creación y patch aceptan char? para ESTADO ('V'/'F')
public sealed class TransferTecnologicaCreateDto
{
    public int       IdPersona                   { get; set; }
    public int       IdResolucion                { get; set; }
    public int       IdTecnologia                { get; set; }
    public int?      IdDistribucionResolucion    { get; set; } // NEW: opcional
    public decimal?  Monto                       { get; set; }   // opcional
    public bool?     Pago                        { get; set; }   // default false si null
    public bool?     Completed                   { get; set; }   // default false si null
    public string?   Titulo                      { get; set; }
    public string?   Descripcion                 { get; set; }
    public char?     Estado                      { get; set; }   // default 'V' si null
    public DateTime? FechaInicio                 { get; set; }
    public DateTime? FechaFin                    { get; set; }
}

public sealed class TransferTecnologicaPatchDto
{
    public int?      IdPersona                   { get; set; }
    public int?      IdResolucion                { get; set; }
    public int?      IdTecnologia                { get; set; }
    public int?      IdDistribucionResolucion    { get; set; } // NEW
    public decimal?  Monto                       { get; set; }
    public bool?     Pago                        { get; set; }
    public bool?     Completed                   { get; set; }
    public string?   Titulo                      { get; set; }
    public string?   Descripcion                 { get; set; }
    public char?     Estado                      { get; set; }   // 'V' o 'F'
    public DateTime? FechaInicio                 { get; set; }
    public DateTime? FechaFin                    { get; set; }
}
