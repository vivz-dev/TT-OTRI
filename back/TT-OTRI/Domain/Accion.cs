// ============================================================================
// Domain/Accion.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Accion
{
    // IDOTRITTACCION (IDENTITY)
    public int IdAccion { get; set; }

    // NOMBRE (VARGRAPHIC(100) NOT NULL)
    public string Nombre { get; set; } = string.Empty;

    // FECHACREACION (TIMESTAMP NOT NULL DEFAULT CURRENT TIMESTAMP)
    public DateTime CreatedAt { get; set; }

    // ULTIMO_CAMBIO (TIMESTAMP NOT NULL DEFAULT CURRENT TIMESTAMP)
    public DateTime UpdatedAt { get; set; }
}