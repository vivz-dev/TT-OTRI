using System.Threading;
using System.Threading.Tasks;

namespace TT_OTRI.Application.Interfaces;
public interface IPersonLookupService
{
    Task<int?> GetPersonIdByEmailAsync(string email, CancellationToken ct = default);
}