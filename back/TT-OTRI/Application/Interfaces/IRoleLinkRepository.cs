namespace TT_OTRI.Application.Interfaces;

public interface IRoleLinkRepository
{
    Task<IReadOnlyList<int>> GetRoleIdsByPersonIdAsync(int idPersona, CancellationToken ct = default);
}