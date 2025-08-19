using TT_OTRI.Application.DTOs;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ICotitularRepository
{
    Task<IEnumerable<Cotitular>> GetAllAsync(CancellationToken ct = default);
    Task<Cotitular?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> AddAsync(Cotitular cotitular, CancellationToken ct = default);
    Task UpdateAsync(Cotitular cotitular, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, CotitularPatchDto dto, CancellationToken ct = default);
}