// ============================================================================
// Domain/BenefInstitucion.cs
// ============================================================================
namespace TT_OTRI.Domain;

// Modelo de dominio (refleja las columnas principales de la tabla)
public sealed class BenefInstitucion
{
    public int Id { get; set; }                          // IDOTRITTBENEFINSTITUCION
    public string Nombre { get; set; } = string.Empty;   // NOMBRE
    public string? Descripcion { get; set; }             // DESCRIPCION
    public int? IdUsuarioCrea { get; set; }              // IDUSUARIOCREA
    public int? IdUsuarioMod { get; set; }               // IDUSUARIOMOD
    public DateTime? FechaCreacion { get; set; }         // FECHACREACION
    public DateTime? FechaModifica { get; set; }         // FECHAMODIFICA
    public DateTime? UltimoCambio { get; set; }          // ULTIMO_CAMBIO
}