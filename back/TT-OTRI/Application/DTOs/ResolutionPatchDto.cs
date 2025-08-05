using TT_OTRI.Domain;

namespace TT_OTRI.Application.DTOs;

public class ResolutionPatchDto
{
    public ResolutionStatus? Estado   { get; set; }      // opcional
    public bool?            Completed { get; set; }      // opcional
}