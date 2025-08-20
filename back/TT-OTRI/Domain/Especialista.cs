// ============================================================================
// Domain/Especialista.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Especialista
{
    public int IdOtriTtEspecialista { get; set; }      // IDOTRITTESPECIALISTA (Identity)
    public string? Nombres { get; set; }               // NOMBRES
    public string? Apellidos { get; set; }             // APELLIDOS
    public string? Identificacion { get; set; }        // IDENTIFICACION
    public string? Correo { get; set; }                // CORREO
    public string? Telefono { get; set; }              // TELEFONO
    public string Tipo { get; set; } = "ADC";          // TIPO (ADC, RTT)
    public DateTime FechaCreacion { get; set; }        // FECHACREACION
    public DateTime UltimoCambio { get; set; }         // ULTIMO_CAMBIO
}