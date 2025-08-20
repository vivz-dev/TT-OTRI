// TT-OTRI/Application/Services/RegaliaService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class RegaliaService
{
    private readonly IRegaliaRepository _repo;

    public RegaliaService(IRegaliaRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<Regalia>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllAsync(ct);

    public Task<Regalia?> GetByIdAsync(int id, CancellationToken ct)
        => _repo.GetByIdAsync(id, ct);

    public async Task<int> CreateAsync(RegaliaCreateDto dto, CancellationToken ct)
    {
        var regalia = new Regalia
        {
            IdTransferenciaTecnologica = dto.IdTransferenciaTecnologica,
            CantidadUnidad = dto.CantidadUnidad,
            CantidadPorcentaje = dto.CantidadPorcentaje,
            EsPorUnidad = dto.EsPorUnidad,
            EsPorcentaje = dto.EsPorcentaje
        };

        await _repo.AddAsync(regalia, ct);
        return regalia.Id;
    }

    public async Task<bool> UpdateAsync(int id, RegaliaCreateDto dto, CancellationToken ct)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing is null) return false;

        existing.IdTransferenciaTecnologica = dto.IdTransferenciaTecnologica;
        existing.CantidadUnidad = dto.CantidadUnidad;
        existing.CantidadPorcentaje = dto.CantidadPorcentaje;
        existing.EsPorUnidad = dto.EsPorUnidad;
        existing.EsPorcentaje = dto.EsPorcentaje;

        await _repo.UpdateAsync(existing, ct);
        return true;
    }

    public Task<bool> PatchAsync(int id, RegaliaPatchDto dto, CancellationToken ct)
        => _repo.PatchAsync(id, dto, ct);
}