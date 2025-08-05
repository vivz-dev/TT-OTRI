using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;
using TT_OTRI.Application.DTOs; 

namespace TT_OTRI.Application.Services;

public class ResolutionService
{
    private readonly IResolutionRepository _repo;
    public ResolutionService(IResolutionRepository repo) => _repo = repo;

    public Task<IEnumerable<Resolution>> ListAsync()              => _repo.GetAllAsync();
    public Task<Resolution?>          GetAsync(int id)            => _repo.GetByIdAsync(id);
    public Task                       CreateAsync(Resolution dto) => _repo.AddAsync(dto);
    
    public async Task<bool> PatchAsync(int id, ResolutionPatchDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return false;

        if (dto.Estado.HasValue)   entity.Estado   = dto.Estado.Value;
        if (dto.Completed.HasValue) entity.Completed = dto.Completed.Value;

        entity.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(entity);
        return true;
    }
}