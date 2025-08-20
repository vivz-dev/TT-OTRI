// Application/Interfaces/IDistribPagoRepository.cs
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IDistribPagoRepository
{
    Task<IEnumerable<DistribPago>> GetAllAsync(CancellationToken ct = default);
    Task<DistribPago?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(DistribPago distribPago, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, DistribPago distribPago, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}