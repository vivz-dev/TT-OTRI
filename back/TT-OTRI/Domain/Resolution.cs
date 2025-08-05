namespace TT_OTRI.Domain;

public enum ResolutionStatus { Borrador, Vigente, Archivada }

public class Resolution
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Titulo { get; set; } = string.Empty;
    public ResolutionStatus Estado { get; set; } = ResolutionStatus.Borrador;
    public bool Completed { get; set; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}