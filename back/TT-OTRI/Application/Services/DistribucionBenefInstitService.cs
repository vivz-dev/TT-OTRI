// ============================================================================
// File: Application/Services/DistribucionBenefInstitService.cs
// Lógica de negocio: validación de FKs, evitar duplicados (distribución+benef).
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class DistribucionBenefInstitService
{
    private readonly IDistribucionBenefInstitRepository _repo;
    private readonly IDistributionResolutionRepository  _distRepo;
    private readonly IBeneficiarioInstitucionRepository _benefRepo;

    public DistribucionBenefInstitService(
        IDistribucionBenefInstitRepository repo,
        IDistributionResolutionRepository  distRepo,
        IBeneficiarioInstitucionRepository benefRepo)
    {
        _repo     = repo;
        _distRepo = distRepo;
        _benefRepo= benefRepo;
    }

    /*-------------------- Lectura --------------------*/
    public Task<IEnumerable<DistribucionBenefInstit>> ListAsync() => _repo.GetAllAsync();
    public Task<IEnumerable<DistribucionBenefInstit>> ListByDistribucionAsync(int distribucionId)
        => _repo.GetByDistribucionAsync(distribucionId);
    public Task<DistribucionBenefInstit?> GetAsync(int id) => _repo.GetByIdAsync(id);

    /*-------------------- Creación -------------------*/
    public async Task<DistribucionBenefInstit?> CreateAsync(DistribucionBenefInstitCreateDto dto)
    {
        if (await _distRepo.GetByIdAsync(dto.DistribucionResolucionId) is null) return null;
        var benef = await _benefRepo.GetByIdAsync(dto.BeneficiarioInstitucionId);
        if (benef is null) return null;

        // Evitar duplicado del par (distribución, beneficiario)
        if (await _repo.GetByPairAsync(dto.DistribucionResolucionId, dto.BeneficiarioInstitucionId) is not null)
            return null;

        var e = new DistribucionBenefInstit
        {
            DistribucionResolucionId  = dto.DistribucionResolucionId,
            BeneficiarioInstitucionId = dto.BeneficiarioInstitucionId,
            Porcentaje                = dto.Porcentaje
        };
        await _repo.AddAsync(e);
        return e;
    }

    /*-------------------- Patch ----------------------*/
    public async Task<bool> PatchAsync(int id, DistribucionBenefInstitPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (dto.DistribucionResolucionId.HasValue)
        {
            if (await _distRepo.GetByIdAsync(dto.DistribucionResolucionId.Value) is null) return false;
            e.DistribucionResolucionId = dto.DistribucionResolucionId.Value;
        }

        if (dto.BeneficiarioInstitucionId.HasValue)
        {
            if (await _benefRepo.GetByIdAsync(dto.BeneficiarioInstitucionId.Value) is null) return false;
            e.BeneficiarioInstitucionId = dto.BeneficiarioInstitucionId.Value;
        }

        // Verifica duplicado con los valores resultantes
        if (await _repo.GetByPairAsync(e.DistribucionResolucionId, e.BeneficiarioInstitucionId) is { } dup && dup.Id != e.Id)
            return false;

        if (dto.Porcentaje.HasValue) e.Porcentaje = dto.Porcentaje.Value;

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*-------------------- Delete ---------------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
