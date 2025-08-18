// ============================================================================
// Application/Interfaces/IBenefInstitucionRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IBenefInstitucionRepository
{
    Task<IReadOnlyList<BenefInstitucion>> GetAllAsync(CancellationToken ct = default);
    Task<BenefInstitucion?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(BenefInstitucion entity, CancellationToken ct = default);
    Task<bool> UpdateAsync(BenefInstitucion entity, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}