// TT-OTRI/Application/Interfaces/IRegaliaRepository.cs

using TT_OTRI.Application.DTOs;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IRegaliaRepository
{
    Task<IEnumerable<Regalia>> GetAllAsync(CancellationToken ct = default);
    Task<Regalia?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Regalia regalia, CancellationToken ct = default);
    Task UpdateAsync(Regalia regalia, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, RegaliaPatchDto dto, CancellationToken ct = default);
}