// -----------------------------------------------------------------------------
// File: Application/Interfaces/IDistributionResolutionRepository.cs
// Contrato de acceso a datos (in-memory, EF, etc.) para distribuciones.
// -----------------------------------------------------------------------------
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IDistributionResolutionRepository
{
    Task<IEnumerable<DistributionResolution>> GetAllAsync   (CancellationToken ct = default);
    Task<IEnumerable<DistributionResolution>> GetByResolutionAsync(
        int resolutionId, CancellationToken ct = default);

    Task<DistributionResolution?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync   (DistributionResolution entity, CancellationToken ct = default);
    Task UpdateAsync(DistributionResolution entity, CancellationToken ct = default);
}