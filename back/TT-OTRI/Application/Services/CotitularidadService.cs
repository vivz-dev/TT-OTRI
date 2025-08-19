// ============================================================================
// File: Application/Services/CotitularidadService.cs
// Lógica de negocio: valida FK (Tecnología) y unicidad por tecnología.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class CotitularidadService
{
    private readonly ICotitularidadRepository _repo;
    private readonly ITecnologiaRepository    _techRepo;

    public CotitularidadService(ICotitularidadRepository repo, ITecnologiaRepository techRepo)
    {
        _repo    = repo;
        _techRepo= techRepo;
    }

    /*----------------------- Lectura -----------------------*/
    public Task<IEnumerable<Cotitularidad>> ListAsync()          => _repo.GetAllAsync();
    public Task<Cotitularidad?>             GetAsync (int id)    => _repo.GetByIdAsync(id);
    public Task<Cotitularidad?>             GetByTechnologyAsync(int techId) => _repo.GetByTechnologyAsync(techId);

    /*----------------------- Creación ----------------------*/
    /// <summary>Crea una cotitularidad si la tecnología existe y no tiene ya una.</summary>
    public async Task<Cotitularidad?> CreateAsync(CotitularidadCreateDto dto)
    {
        if (await _techRepo.GetByIdAsync(dto.TechnologyId) is null) return null;              // FK
        if (await _repo.GetByTechnologyAsync(dto.TechnologyId) is not null) return null;      // unicidad

        var e = new Cotitularidad { TechnologyId = dto.TechnologyId };
        await _repo.AddAsync(e);
        return e;
    }

    /*------------------------ Patch ------------------------*/
    /// <summary>Mueve la cotitularidad a otra tecnología validando FK y unicidad.</summary>
    public async Task<bool> PatchAsync(int id, CotitularidadPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (dto.TechnologyId.HasValue)
        {
            var newTechId = dto.TechnologyId.Value;
            if (await _techRepo.GetByIdAsync(newTechId) is null) return false;                // FK
            var existing = await _repo.GetByTechnologyAsync(newTechId);
            if (existing is not null && existing.Id != e.Id) return false;                    // unicidad
            e.TechnologyId = newTechId;
        }

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*------------------------ Delete -----------------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
