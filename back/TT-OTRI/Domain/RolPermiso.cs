// Domain/RolPermiso.cs
namespace TT_OTRI.Domain;

public sealed class RolPermiso
{
    public int Id { get; set; }                     // IDOTRITTROLPERMISO
    public int IdRol { get; set; }                  // IDROLES
    public int IdAccion { get; set; }               // IDOTRITTACCION
    public bool Visualizar { get; set; }            // VISUALIZAR
    public bool Editar { get; set; }                // EDITAR
    public bool Inhabilitar { get; set; }           // INHABILITAR
    public bool Crear { get; set; }                 // CREAR
    public DateTime FechaCreacion { get; set; }     // FECHACREACION
    public DateTime UltimoCambio { get; set; }      // ULTIMO_CAMBIO
}