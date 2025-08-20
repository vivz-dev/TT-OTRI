// ============================================================================
// Domain/RolPersona.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class RolPersona
{
    public int      IdRolPersona { get; set; }   // IDROLESPERSONA
    public short    IdRol        { get; set; }   // IDROLES (SMALLINT)
    public int      IdPersona    { get; set; }   // IDPERSONA
    public DateTime? FechaInicio { get; set; }   // FECHAINICIO (DATE)
    public DateTime? FechaFin    { get; set; }   // FECHAFIN (DATE)

    public long?     Version      { get; set; }  // VERSION
    public DateTime? UltimoCambio { get; set; }  // ULTIMO_CAMBIO
}