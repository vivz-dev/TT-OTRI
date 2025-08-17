using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TT_OTRI.Application.Interfaces;
public interface IRoleLinkService
{
    Task<IReadOnlyList<int>> GetRoleIdsByPersonIdAsync(int idPersona, CancellationToken ct = default);
}