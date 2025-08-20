// ============================================================================
// Domain/TipoTransferTecnologica.cs
// ============================================================================
namespace TT_OTRI.Domain;

public sealed class TipoTransferTecnologica
{
    public int      Id          { get; set; }  // IDOTRITTTIPOTRANSFERTECNOLOGICA
    public string   Nombre      { get; set; } = string.Empty; // NOMBRE (VARGRAPHIC(100))
    public DateTime CreatedAt   { get; set; }  // FECHACREACION (TIMESTAMP not null)
    public DateTime UpdatedAt   { get; set; }  // ULTIMO_CAMBIO (TIMESTAMP not null)
}