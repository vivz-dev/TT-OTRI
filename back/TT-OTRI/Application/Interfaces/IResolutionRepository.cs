using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IResolutionRepository
{
    Task<IEnumerable<Resolution>> GetAllAsync(CancellationToken ct = default);
}