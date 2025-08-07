// -------------------------------------------------------------------------
// File: Application/DTOs/ResolutionCreateDto.cs
// DTO para peticiones POST (crear resolución).  Excluye campos calculados.
// -------------------------------------------------------------------------
using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

public class ResolutionCreateDto
{
    public int      IdUsuario       { get; set; }
    public string   Codigo          { get; set; } = string.Empty;
    public string   Titulo          { get; set; } = string.Empty;
    public string   Descripcion     { get; set; } = string.Empty;
    public DateTime FechaResolucion { get; set; }
    public DateTime FechaVigencia   { get; set; }
}