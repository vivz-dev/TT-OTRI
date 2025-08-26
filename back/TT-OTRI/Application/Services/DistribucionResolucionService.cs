// ============================================================================
// Application/Services/DistribucionResolucionService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class DistribucionResolucionService
{
    private readonly IDistribucionResolucionRepository _repo;

    public DistribucionResolucionService(IDistribucionResolucionRepository repo)
    {
        _repo = repo;
    }

    public Task<IReadOnlyList<DistribucionResolucionDto>> GetByResolucionAsync(int idResolucion, CancellationToken ct)
        => _repo.GetByResolucionAsync(idResolucion, ct);

    public Task<DistribucionResolucionDto?> GetByIdAsync(int id, CancellationToken ct)
        => _repo.GetByIdAsync(id, ct);

// Application/Services/DistribucionResolucionService.cs
    public async Task<int> CreateAsync(int idResolucion, CreateDistribucionResolucionDto dto, CancellationToken ct)
    {
        if (dto.PorcSubtotalAutores < 0 || dto.PorcSubtotalInstitut < 0)
            throw new ArgumentException("Los porcentajes no pueden ser negativos.");

        if (dto.MontoMaximo.HasValue && dto.MontoMaximo.Value < dto.MontoMinimo)
            throw new ArgumentException("MontoMaximo no puede ser menor que MontoMinimo.");

        return await _repo.CreateAsync(idResolucion, dto, ct);
    }

    public Task<bool> PatchAsync(int id, PatchDistribucionResolucionDto dto, CancellationToken ct)
        => _repo.PatchAsync(id, dto, ct);
}