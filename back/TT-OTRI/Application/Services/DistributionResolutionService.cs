// -----------------------------------------------------------------------------
// File: Application/Services/DistributionResolutionService.cs
// Orquesta la lógica para crear, leer y actualizar distribuciones.
// -----------------------------------------------------------------------------
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class DistributionResolutionService
{
    private readonly IDistributionResolutionRepository _repo;
    private readonly IResolutionRepository             _resolutionRepo; // para validar FK

    public DistributionResolutionService(
        IDistributionResolutionRepository repo,
        IResolutionRepository             resolutionRepo)
    {
        _repo = repo;
        _resolutionRepo = resolutionRepo;
    }

    /*---------------------- Lectura -------------------------------------*/
    public Task<IEnumerable<DistributionResolution>> ListAsync()
        => _repo.GetAllAsync();

    public Task<IEnumerable<DistributionResolution>> ListByResolutionAsync(int resolutionId)
        => _repo.GetByResolutionAsync(resolutionId);

    public Task<DistributionResolution?> GetAsync(int id)
        => _repo.GetByIdAsync(id);

    /*---------------------- Creación ------------------------------------*/
    public async Task<int?> CreateAsync(DistributionCreateDto dto)
    {
        // valida que exista la resolución
        if (await _resolutionRepo.GetByIdAsync(dto.ResolutionId) is null)
            return null;

        var entity = new DistributionResolution
        {
            ResolutionId         = dto.ResolutionId,
            MontoMaximo          = dto.MontoMaximo,
            MontoMinimo          = dto.MontoMinimo,
            PorcSubtotalAutores  = dto.PorcSubtotalAutores,
            PorcSubtotalInstitut = dto.PorcSubtotalInstitut
        };
        await _repo.AddAsync(entity);
        return entity.Id;
    }

    /*---------------------- Patch ---------------------------------------*/
    public async Task<bool> PatchAsync(int id, DistributionPatchDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return false;

        // Si quieren mover la distribución a otra resolución se valida FK
        if (dto.ResolutionId.HasValue)
        {
            if (await _resolutionRepo.GetByIdAsync(dto.ResolutionId.Value) is null)
                return false;                           // FK no existe
            entity.ResolutionId = dto.ResolutionId.Value;
        }

        if (dto.MontoMaximo.HasValue)          entity.MontoMaximo          = dto.MontoMaximo.Value;
        if (dto.MontoMinimo.HasValue)          entity.MontoMinimo          = dto.MontoMinimo.Value;
        if (dto.PorcSubtotalAutores.HasValue)  entity.PorcSubtotalAutores  = dto.PorcSubtotalAutores.Value;
        if (dto.PorcSubtotalInstitut.HasValue) entity.PorcSubtotalInstitut = dto.PorcSubtotalInstitut.Value;

        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity);
        return true;
    }

}
