namespace TT_OTRI.Domain;

/// <summary>
/// Estados válidos de una resolución.
/// </summary>
public enum ResolutionStatus
{
    Vigente,
    Derogada
}

public class Resolution
{
    // --- Identidad ---
    public int    Id      { get; set; }
    public string Numero  { get; set; } = string.Empty; // "24-07-228"

    // --- Estado y color asociado ---
    public ResolutionStatus Estado { get; set; } = ResolutionStatus.Vigente;

    // --- Texto principal ---
    public string Titulo      { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    // --- Fechas ---
    public DateTime FechaResolucion { get; set; }       
    public DateTime FechaVigencia{ get; set; }       // 2025-09-16

    // --- Metadatos ---
    public string UsuarioRegistrador { get; set; } = string.Empty;
    public bool   Completed          { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }  = DateTime.UtcNow;
}