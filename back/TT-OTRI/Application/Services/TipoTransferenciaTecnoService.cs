// Application/Services/TipoTransferenciaTecnoService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class TipoTransferenciaTecnoService
{
    private readonly ITipoTransferenciaTecnoRepository _repo;

    public TipoTransferenciaTecnoService(ITipoTransferenciaTecnoRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<TipoTransferenciaTecnoReadDto>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllAsync(ct);

    public Task<TipoTransferenciaTecnoReadDto?> GetByIdAsync(int id, CancellationToken ct)
        => _repo.GetByIdAsync(id, ct);

    public Task<int> CreateAsync(TipoTransferenciaTecnoCreateDto dto, CancellationToken ct)
        => _repo.CreateAsync(dto, ct);

    public Task<bool> UpdateAsync(int id, TipoTransferenciaTecnoPatchDto dto, CancellationToken ct)
        => _repo.UpdateAsync(id, dto, ct);

    public Task<bool> DeleteAsync(int id, CancellationToken ct)
        => _repo.DeleteAsync(id, ct);
}