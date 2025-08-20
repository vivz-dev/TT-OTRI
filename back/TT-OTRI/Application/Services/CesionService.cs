// ============================================================================
// Application/Services/CesionService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class CesionService
{
    private readonly ICesionRepository _repo;

    public CesionService(ICesionRepository repo)
    {
        _repo = repo;
    }

    public Task<IReadOnlyList<CesionReadDto>> GetAllAsync(CancellationToken ct = default)
        => _repo.GetAllAsync(ct);

    public Task<CesionReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => _repo.GetByIdAsync(id, ct);

    public async Task<int> CreateAsync(CesionCreateDto dto, CancellationToken ct = default)
    {
        // Validaciones básicas
        if (dto.IdOtriTtTransferTecnologica <= 0)
            throw new ArgumentException("El IdOtriTtTransferTecnologica debe ser mayor a 0.");

        return await _repo.CreateAsync(dto, ct);
    }

    public Task<bool> PatchAsync(int id, CesionPatchDto dto, CancellationToken ct = default)
    {
        if (dto.IdOtriTtTransferTecnologica.HasValue && dto.IdOtriTtTransferTecnologica.Value <= 0)
            throw new ArgumentException("El IdOtriTtTransferTecnologica debe ser mayor a 0.");

        return _repo.PatchAsync(id, dto, ct);
    }
}