// ============================================================================
// Domain/Unidad.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class Unidad
{
    public int    IdUnidad      { get; set; }  // SMALLINT en DB -> int en dominio
    public string NombreUnidad  { get; set; } = string.Empty;
}