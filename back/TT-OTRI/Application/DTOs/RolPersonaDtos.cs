// ============================================================================
// Application/DTOs/RolPersonaDtos.cs
// ============================================================================
namespace TT_OTRI.Application.DTOs;

public sealed class RoleLiteDto
{
    public int   IdRolPersona { get; set; } // ← PK de ESPOL.TBL_ROL_PERSONA
    public short IdRol        { get; set; }
    public string Nombre      { get; set; } = string.Empty;
}

public sealed class PersonaConRolesDto
{
    public int    IdPersona { get; set; }
    public string Nombres   { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;

    /// <summary>Roles (solo del sistema OTRI) con el ID del vínculo rol-persona.</summary>
    public List<RoleLiteDto> Roles { get; set; } = new();
}

public sealed class RolPersonaCreateDto
{
    public int   IdPersona { get; set; }
    public short IdRol     { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin    { get; set; }
}

public sealed class RolPersonaPatchDto
{
    public short?   IdRol       { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin    { get; set; }
}