// ============================================================================
// Application/Interfaces/IDistribBenefInstitucionRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IDistribBenefInstitucionRepository
{
    Task<IReadOnlyList<DistribBenefInstitucion>> GetAllAsync(CancellationToken ct = default);
    Task<DistribBenefInstitucion?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(DistribBenefInstitucion entity, CancellationToken ct = default);
    Task<bool> UpdatePartialAsync(int id, int? idDistribucionResolucion, int? idBenefInstitucion,
        decimal? porcentaje, int? idUsuarioMod, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}