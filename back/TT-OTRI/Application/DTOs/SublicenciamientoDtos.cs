namespace TT_OTRI.Application.DTOs;

public sealed class SublicenciamientoReadDto
{
    public int      IdSublicenciamiento { get; set; }
    public int      IdLicenciamiento    { get; set; }
    public int?     LicenciasMinimas    { get; set; }
    public int?     LicenciasMaximas    { get; set; }
    public decimal? PorcEspol           { get; set; }
    public decimal? PorcReceptor        { get; set; }
    public DateTime FechaCreacion       { get; set; }
    public DateTime UltimoCambio        { get; set; }
}

public sealed class SublicenciamientoCreateDto
{
    public int      IdLicenciamiento { get; set; }      // requerido
    public int?     LicenciasMinimas { get; set; }
    public int?     LicenciasMaximas { get; set; }
    public decimal? PorcEspol        { get; set; }      // si se envía: 0..1
    public decimal? PorcReceptor     { get; set; }      // si se envía: 0..1
}

public sealed class SublicenciamientoPatchDto
{
    public int?     IdLicenciamiento { get; set; }
    public int?     LicenciasMinimas { get; set; }
    public int?     LicenciasMaximas { get; set; }
    public decimal? PorcEspol        { get; set; }
    public decimal? PorcReceptor     { get; set; }
}