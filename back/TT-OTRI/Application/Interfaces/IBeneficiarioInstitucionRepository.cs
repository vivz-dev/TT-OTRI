// ============================================================================
// File: Application/Interfaces/IBeneficiarioInstitucionRepository.cs
// Contrato de repositorio para BeneficiarioInstitucion.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IBeneficiarioInstitucionRepository
{
    Task<IEnumerable<BeneficiarioInstitucion>> GetAllAsync(CancellationToken ct = default);
    Task<BeneficiarioInstitucion?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync   (BeneficiarioInstitucion entity, CancellationToken ct = default);
    Task UpdateAsync(BeneficiarioInstitucion entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}