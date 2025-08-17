using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public class RoleLinkService : IRoleLinkService
{
    private readonly IRoleLinkRepository _repo;
    public RoleLinkService(IRoleLinkRepository repo) => _repo = repo;

    public Task<IReadOnlyList<int>> GetRoleIdsByPersonIdAsync(int idPersona, CancellationToken ct = default)
        => _repo.GetRoleIdsByPersonIdAsync(idPersona, ct);
}