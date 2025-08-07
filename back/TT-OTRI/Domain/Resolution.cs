// -------------------------------------------------------------------------
// File: Domain/Resolution.cs
// Define la entidad de dominio “Resolution”, representación 1-a-1 de la
// tabla T_OTRI_TT_RESOLUCION.  Incluye propiedades, enum de estado y
// marcas de tiempo.
//
// NOTA: Mapear con EF Core => builder.ToTable("T_OTRI_TT_RESOLUCION")
// -------------------------------------------------------------------------
namespace TT_OTRI.Domain;

public enum ResolutionStatus { Vigente = 'V', Derogada = 'D' }

public class Resolution
{
    // Identidad y relaciones
    public int Id { get; set; }                  // IDOTRIRESOLUCION
    public int IdUsuario { get; set; }           // FK → usuario ESPOL

    // Campos descriptivos
    public string Codigo       { get; set; } = string.Empty;
    public string Titulo       { get; set; } = string.Empty;
    public string Descripcion  { get; set; } = string.Empty;

    // Estado y fechas
    public ResolutionStatus Estado         { get; set; } = ResolutionStatus.Vigente;
    public DateTime         FechaResolucion{ get; set; }
    public DateTime         FechaVigencia  { get; set; }

    // Metadatos
    public bool     Completed  { get; set; } = false;
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt  { get; set; } = DateTime.UtcNow;
}