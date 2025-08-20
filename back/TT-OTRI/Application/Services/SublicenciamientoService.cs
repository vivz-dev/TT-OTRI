using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class SublicenciamientoService
{
    private readonly ISublicenciamientoRepository _repo;

    public SublicenciamientoService(ISublicenciamientoRepository repo) => _repo = repo;

    public Task<IReadOnlyList<SublicenciamientoReadDto>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllAsync(ct);

    public Task<SublicenciamientoReadDto?> GetByIdAsync(int id, CancellationToken ct)
        => _repo.GetByIdAsync(id, ct);

    public async Task<int> CreateAsync(SublicenciamientoCreateDto dto, CancellationToken ct)
    {
        ValidatePercent(dto.PorcEspol, nameof(dto.PorcEspol));
        ValidatePercent(dto.PorcReceptor, nameof(dto.PorcReceptor));
        ValidateMinMax(dto.LicenciasMinimas, dto.LicenciasMaximas);

        if (dto.IdLicenciamiento <= 0)
            throw new ArgumentException("IdLicenciamiento es requerido y debe ser > 0");

        return await _repo.CreateAsync(dto, ct);
    }

    public async Task<bool> PatchAsync(int id, SublicenciamientoPatchDto dto, CancellationToken ct)
    {
        ValidatePercent(dto.PorcEspol, nameof(dto.PorcEspol));
        ValidatePercent(dto.PorcReceptor, nameof(dto.PorcReceptor));
        ValidateMinMax(dto.LicenciasMinimas, dto.LicenciasMaximas);

        return await _repo.PatchAsync(id, dto, ct);
    }

    private static void ValidatePercent(decimal? p, string name)
    {
        if (p.HasValue && (p.Value < 0m || p.Value > 1m))
            throw new ArgumentOutOfRangeException(name, "Debe estar entre 0 y 1.");
    }

    private static void ValidateMinMax(int? min, int? max)
    {
        if (min.HasValue && max.HasValue && min.Value > max.Value)
            throw new ArgumentException("LicenciasMinimas no puede ser mayor que LicenciasMaximas.");
    }
}