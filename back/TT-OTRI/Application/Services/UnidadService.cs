// ============================================================================
// Application/Services/UnidadService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class UnidadService
{
    private readonly IUnidadRepository _repo;

    public UnidadService(IUnidadRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<UnidadReadDto>> GetAllAsync(CancellationToken ct)
    {
        var data = await _repo.GetAllActivasAsync(ct);
        return data
            .Select(u => new UnidadReadDto { IdUnidad = u.IdUnidad, NombreUnidad = u.NombreUnidad })
            .ToList();
    }

    public async Task<UnidadReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var u = await _repo.GetByIdActivaAsync(id, ct);
        return u is null ? null : new UnidadReadDto { IdUnidad = u.IdUnidad, NombreUnidad = u.NombreUnidad };
    }
}