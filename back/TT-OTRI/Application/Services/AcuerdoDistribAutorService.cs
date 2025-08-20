using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class AcuerdoDistribAutorService
{
    private readonly IAcuerdoDistribAutorRepository _repo;

    public AcuerdoDistribAutorService(IAcuerdoDistribAutorRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<AcuerdoDistribAutorReadDto>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllAsync(ct);

    public Task<AcuerdoDistribAutorReadDto?> GetByIdAsync(int id, CancellationToken ct)
        => _repo.GetByIdAsync(id, ct);

    public Task<int> CreateAsync(AcuerdoDistribAutorCreateDto dto, CancellationToken ct)
        => _repo.AddAsync(dto, ct);

    public Task<bool> PatchAsync(int id, AcuerdoDistribAutorPatchDto dto, CancellationToken ct)
        => _repo.PatchAsync(id, dto, ct);
}