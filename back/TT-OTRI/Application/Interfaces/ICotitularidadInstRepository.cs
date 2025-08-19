using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ICotitularidadInstRepository
{
    Task<IEnumerable<CotitularidadInst>> GetAllAsync(CancellationToken ct = default);
    Task<CotitularidadInst?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(CotitularidadInst entity, CancellationToken ct = default);
    Task UpdateAsync(CotitularidadInst entity, CancellationToken ct = default);
}