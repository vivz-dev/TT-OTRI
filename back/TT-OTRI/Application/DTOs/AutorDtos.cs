// ============================================================================
// Application/DTOs/AutorDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class AutorReadDto
{
    public int      IdOtriTtAutor                { get; set; }
    public int      IdOtriTtAcuerdoDistribAutores { get; set; }
    public int      IdUnidad                     { get; set; }
    public int      IdPersona                    { get; set; }
    public decimal? PorcAutor                    { get; set; }
    public decimal? PorcUnidad                   { get; set; }
    public DateTime FechaCreacion                { get; set; }
    public DateTime UltimoCambio                 { get; set; }
}

public sealed class AutorCreateDto
{
    /// <summary>
    /// Opcional. Si no lo envías, el repo calculará MAX+1 de la tabla.
    /// </summary>
    public int?     IdOtriTtAutor                { get; set; }
    public int      IdOtriTtAcuerdoDistribAutores { get; set; }
    public int      IdUnidad                     { get; set; }
    public int      IdPersona                    { get; set; }
    public decimal? PorcAutor                    { get; set; }
    public decimal? PorcUnidad                   { get; set; }
}

public sealed class AutorPatchDto
{
    public int?     IdOtriTtAcuerdoDistribAutores { get; set; }
    public int?     IdUnidad                     { get; set; }
    public int?     IdPersona                    { get; set; }
    public decimal? PorcAutor                    { get; set; }
    public decimal? PorcUnidad                   { get; set; }
}