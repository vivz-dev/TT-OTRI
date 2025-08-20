using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IAcuerdoDistribAutorRepository
{
    Task<IEnumerable<AcuerdoDistribAutorReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<AcuerdoDistribAutorReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> AddAsync(AcuerdoDistribAutorCreateDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, AcuerdoDistribAutorPatchDto dto, CancellationToken ct = default);
}