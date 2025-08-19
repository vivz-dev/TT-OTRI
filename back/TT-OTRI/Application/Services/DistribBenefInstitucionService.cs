// Application/Services/DistribBenefInstitucionService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class DistribBenefInstitucionService
{
    private readonly IDistribBenefInstitucionRepository _repo;

    public DistribBenefInstitucionService(IDistribBenefInstitucionRepository repo)
        => _repo = repo;

    public async Task<IReadOnlyList<DistribBenefInstitucionReadDto>> GetAllAsync(CancellationToken ct = default)
        => (await _repo.GetAllAsync(ct)).Select(MapToRead).ToList();

    public async Task<DistribBenefInstitucionReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => (await _repo.GetByIdAsync(id, ct)) is { } e ? MapToRead(e) : null;

    public async Task<int> CreateAsync(DistribBenefInstitucionCreateDto dto, CancellationToken ct = default)
    {
        // repo necesita ambos NOT NULL (CREA y MOD). MOD = CREA en INSERT.
        var entity = new DistribBenefInstitucion
        {
            IdDistribBenefInstitucion = dto.IdDistribBenefInstitucion ?? 0,
            IdDistribucionResolucion  = dto.IdDistribucionResolucion,
            IdBenefInstitucion        = dto.IdBenefInstitucion,
            Porcentaje                = dto.Porcentaje,
            IdUsuarioCrea             = dto.IdUsuarioCrea,
            IdUsuarioMod              = dto.IdUsuarioCrea
        };
        return await _repo.CreateAsync(entity, ct);
    }

    public Task<bool> PatchAsync(int id, DistribBenefInstitucionPatchDto dto, CancellationToken ct = default)
        => _repo.UpdatePartialAsync(id, dto.IdDistribucionResolucion, dto.IdBenefInstitucion, dto.Porcentaje, dto.IdUsuarioMod, ct);

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => _repo.DeleteAsync(id, ct);

    private static DistribBenefInstitucionReadDto MapToRead(DistribBenefInstitucion e) => new()
    {
        IdDistribBenefInstitucion = e.IdDistribBenefInstitucion,
        IdDistribucionResolucion  = e.IdDistribucionResolucion,
        IdBenefInstitucion        = e.IdBenefInstitucion,
        IdUsuarioCrea             = e.IdUsuarioCrea,
        IdUsuarioMod              = e.IdUsuarioMod,
        Porcentaje                = e.Porcentaje,
        FechaCreacion             = e.FechaCreacion,
        FechaModifica             = e.FechaModifica,
        UltimoCambio              = e.UltimoCambio
    };
}
