// -------------------------------------------------------------------------
// File: Application/DTOs/ResolutionPatchDto.cs
// Permite modificar CUALQUIER atributo de la resolución.  Todas las
// propiedades son opcionales: solo las presentes en el JSON se aplican.
// -------------------------------------------------------------------------
using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

public class ResolutionPatchDto
{
    public int?              IdUsuario       { get; set; }
    public string?           Codigo          { get; set; }
    public string?           Titulo          { get; set; }
    public string?           Descripcion     { get; set; }
    public ResolutionStatus? Estado          { get; set; }
    public DateTime?         FechaResolucion { get; set; }
    public DateTime?         FechaVigencia   { get; set; }
    public bool?             Completed       { get; set; }
}