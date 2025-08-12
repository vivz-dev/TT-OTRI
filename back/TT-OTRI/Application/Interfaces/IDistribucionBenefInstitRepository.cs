// ============================================================================
// File: Application/Interfaces/IDistribucionBenefInstitRepository.cs
// Contrato de repositorio para DistribucionBenefInstit.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IDistribucionBenefInstitRepository
{
    Task<IEnumerable<DistribucionBenefInstit>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<DistribucionBenefInstit>> GetByDistribucionAsync(int distribucionId, CancellationToken ct = default);
    Task<DistribucionBenefInstit?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task<DistribucionBenefInstit?>             GetByPairAsync(int distribucionId, int beneficiarioId, CancellationToken ct = default);
    Task AddAsync   (DistribucionBenefInstit entity, CancellationToken ct = default);
    Task UpdateAsync(DistribucionBenefInstit entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}