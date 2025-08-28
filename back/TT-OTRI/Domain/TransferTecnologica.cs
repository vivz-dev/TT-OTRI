// ============================================================================
// Domain/TransferTecnologica.cs
// ============================================================================
namespace TT_OTRI.Domain;

public enum TransferStatus
{
    Vigente    = 'V', // Vigente
    Finalizada = 'F', // Finalizada
}

public sealed class TransferTecnologica
{
    public int           Id                          { get; set; }  // IDOTRITTTRANSFERTECNOLOGICA
    public int           IdPersona                   { get; set; }  // IDPERSONA (FK TBL_PERSONA)
    public int           IdResolucion                { get; set; }  // IDOTRITTRESOLUCION (FK)
    public int           IdTecnologia                { get; set; }  // IDOTRITTTECNOLOGIA (FK)
    public int?          IdDistribucionResolucion    { get; set; }  // NEW: IDOTRITTDISTRIBUCIONRESOLUCION (FK)
    public decimal?      Monto                       { get; set; }  // MONTO DEC(15,2) nullable
    public bool          Pago                        { get; set; }  // PAGO SMALLINT (1/0)
    public bool          Completed                   { get; set; }  // COMPLETADO SMALLINT (1/0)
    public string        Titulo                      { get; set; } = string.Empty; // VARGRAPHIC(100)
    public string        Descripcion                 { get; set; } = string.Empty; // VARGRAPHIC(100)
    public TransferStatus Estado                     { get; set; } = TransferStatus.Vigente; // CHAR(1)
    public DateTime?     FechaInicio                 { get; set; }  // DATE nullable
    public DateTime?     FechaFin                    { get; set; }  // DATE nullable
    public DateTime      CreatedAt                   { get; set; }  // FECHACREACION TIMESTAMP
    public DateTime      UpdatedAt                   { get; set; }  // ULTIMO_CAMBIO TIMESTAMP
}