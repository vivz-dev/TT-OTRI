// ============================================================================
// Application/Interfaces/ILicenciamientoRepository.cs
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ILicenciamientoRepository
{
    Task<IEnumerable<Licenciamiento>> GetAllAsync(CancellationToken ct = default);
    Task<Licenciamiento?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Licenciamiento licenciamiento, CancellationToken ct = default);
    Task UpdateAsync(Licenciamiento licenciamiento, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}