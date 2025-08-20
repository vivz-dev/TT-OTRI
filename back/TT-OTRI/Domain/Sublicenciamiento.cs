namespace TT_OTRI.Domain;

public sealed class Sublicenciamiento
{
    public int       IdSublicenciamiento { get; set; }   // IDOTRITTSUBLICENCIAMIENTO
    public int       IdLicenciamiento    { get; set; }   // IDOTRITTLICENCIAMIENTO (FK)

    public int?      LicenciasMinimas    { get; set; }   // LICENCIASMINIMAS
    public int?      LicenciasMaximas    { get; set; }   // LICENCIASMAXIMAS
    public decimal?  PorcEspol           { get; set; }   // PORCESPOL (0..1)
    public decimal?  PorcReceptor        { get; set; }   // PORCRECEPTOR (0..1)

    public DateTime  FechaCreacion       { get; set; }   // FECHACREACION
    public DateTime  UltimoCambio        { get; set; }   // ULTIMO_CAMBIO
}
