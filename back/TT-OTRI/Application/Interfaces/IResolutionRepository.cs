using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IResolutionRepository
{
    Task<IEnumerable<Resolution>> GetAllAsync(CancellationToken ct = default);
    Task<Resolution?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Resolution resolution, CancellationToken ct = default);
    Task UpdateAsync(Resolution resolution, CancellationToken ct = default);   // ← ya existía si implementaste PUT

}