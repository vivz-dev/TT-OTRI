// ============================================================================
// Application/Services/RolPersonaService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class RolPersonaService
{
    private readonly IRolPersonaRepository _repo;
    public RolPersonaService(IRolPersonaRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<PersonaConRolesDto>> GetAllAsync(CancellationToken ct = default)
    {
        var rows = await _repo.GetPersonasConRolesOtriAsync(ct);
        var dict = new Dictionary<int, PersonaConRolesDto>();

        foreach (var r in rows)
        {
            if (!dict.TryGetValue(r.IdPersona, out var p))
            {
                p = new PersonaConRolesDto
                {
                    IdPersona = r.IdPersona,
                    Nombres   = r.Nombres,
                    Apellidos = r.Apellidos
                };
                dict[r.IdPersona] = p;
            }

            p.Roles.Add(new RoleLiteDto
            {
                IdRolPersona = r.IdRolPersona,
                IdRol        = r.IdRol,
                Nombre       = r.NombreRol
            });
        }

        return dict.Values
            .OrderBy(v => v.Apellidos)
            .ThenBy(v => v.Nombres)
            .ToList();
    }

    public Task<int>  CreateAsync (RolPersonaCreateDto dto, CancellationToken ct = default) => _repo.CreateAsync(dto, ct);
    public Task<bool> PatchAsync  (int idRolPersona, RolPersonaPatchDto dto, CancellationToken ct = default) => _repo.PatchAsync(idRolPersona, dto, ct);
    public Task<bool> DeleteAsync (int idRolPersona, CancellationToken ct = default) => _repo.DeleteAsync(idRolPersona, ct);
}