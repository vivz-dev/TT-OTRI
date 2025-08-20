// ============================================================================
// Application/Interfaces/IRolPersonaRepository.cs
// ============================================================================
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IRolPersonaRepository
{
    /// <summary>Filas planas persona+rol OTRI; incluye IDROLESPERSONA.</summary>
    Task<IReadOnlyList<(int IdPersona, string Nombres, string Apellidos, int IdRolPersona, short IdRol, string NombreRol)>>
        GetPersonasConRolesOtriAsync(CancellationToken ct = default);

    Task<int>  CreateAsync(RolPersonaCreateDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync (int idRolPersona, RolPersonaPatchDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int idRolPersona, CancellationToken ct = default);
}