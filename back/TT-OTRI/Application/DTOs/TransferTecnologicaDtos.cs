// ============================================================================
// Application/DTOs/TransferTecnologicaDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class TransferTecnologicaReadDto
{
    public int       Id                 { get; set; }
    public int       IdPersona          { get; set; }
    public int       IdResolucion       { get; set; }
    public int       IdTecnologia       { get; set; }
    public decimal?  Monto              { get; set; }
    public bool      Pago               { get; set; }
    public bool      Completed          { get; set; }
    public string    Titulo             { get; set; } = string.Empty;
    public string    Descripcion        { get; set; } = string.Empty;
    public char      Estado             { get; set; }   // 'V' o 'F'
    public DateTime? FechaInicio        { get; set; }
    public DateTime? FechaFin           { get; set; }
    public DateTime  CreatedAt          { get; set; }
    public DateTime  UpdatedAt          { get; set; }
}

public sealed class TransferTecnologicaCreateDto
{
    public int       IdPersona          { get; set; }
    public int       IdResolucion       { get; set; }
    public int       IdTecnologia       { get; set; }
    public decimal?  Monto              { get; set; }   // opcional
    public bool?     Pago               { get; set; }   // default false si null
    public bool?     Completed          { get; set; }   // default false si null
    public string?   Titulo             { get; set; }
    public string?   Descripcion        { get; set; }
    public char?     Estado             { get; set; }   // default 'V' si null
    public DateTime? FechaInicio        { get; set; }
    public DateTime? FechaFin           { get; set; }
}

public sealed class TransferTecnologicaPatchDto
{
    public int?      IdPersona          { get; set; }
    public int?      IdResolucion       { get; set; }
    public int?      IdTecnologia       { get; set; }
    public decimal?  Monto              { get; set; }
    public bool?     Pago               { get; set; }
    public bool?     Completed          { get; set; }
    public string?   Titulo             { get; set; }
    public string?   Descripcion        { get; set; }
    public char?     Estado             { get; set; }   // 'V' o 'F'
    public DateTime? FechaInicio        { get; set; }
    public DateTime? FechaFin           { get; set; }
}
