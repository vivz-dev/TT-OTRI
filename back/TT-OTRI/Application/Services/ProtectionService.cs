// ============================================================================
// File: Application/Services/ProtectionService.cs
// Lógica de negocio: valida FKs (Technology, TipoProteccion), evita duplicados
// por par (TechnologyId, TipoProteccionId) y expone operaciones CRUD.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class ProtectionService
{
    private readonly IProtectionRepository      _repo;
    private readonly ITechnologyRepository      _techRepo;
    private readonly ITipoProteccionRepository  _tipoRepo;

    public ProtectionService(
        IProtectionRepository     repo,
        ITechnologyRepository     techRepo,
        ITipoProteccionRepository tipoRepo)
    {
        _repo     = repo;
        _techRepo = techRepo;
        _tipoRepo = tipoRepo;
    }

    /*---------------------- Lectura ----------------------*/
    public Task<IEnumerable<Protection>> ListAsync() => _repo.GetAllAsync();
    public Task<IEnumerable<Protection>> ListByTechnologyAsync(int techId) => _repo.GetByTechnologyAsync(techId);
    public Task<Protection?> GetAsync(int id) => _repo.GetByIdAsync(id);

    /*---------------------- Creación ---------------------*/
    public async Task<Protection?> CreateAsync(ProtectionCreateDto dto)
    {
        if (await _techRepo.GetByIdAsync(dto.TechnologyId) is null) return null;
        if (await _tipoRepo.GetByIdAsync (dto.TipoProteccionId) is null) return null;

        // evitar duplicado tecnología + tipo
        if (await _repo.GetByPairAsync(dto.TechnologyId, dto.TipoProteccionId) is not null) return null;

        var e = new Protection
        {
            TechnologyId            = dto.TechnologyId,
            TipoProteccionId        = dto.TipoProteccionId,
            FechaConcesionSolicitud = dto.FechaConcesionSolicitud
        };
        await _repo.AddAsync(e);
        return e;
    }

    /*---------------------- Patch ------------------------*/
    public async Task<bool> PatchAsync(int id, ProtectionPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (dto.TechnologyId.HasValue)
        {
            if (await _techRepo.GetByIdAsync(dto.TechnologyId.Value) is null) return false;
            e.TechnologyId = dto.TechnologyId.Value;
        }
        if (dto.TipoProteccionId.HasValue)
        {
            if (await _tipoRepo.GetByIdAsync(dto.TipoProteccionId.Value) is null) return false;
            e.TipoProteccionId = dto.TipoProteccionId.Value;
        }

        // validar duplicado con el resultado final
        if (await _repo.GetByPairAsync(e.TechnologyId, e.TipoProteccionId) is { } dup && dup.Id != e.Id)
            return false;

        if (dto.FechaConcesionSolicitud.HasValue)
            e.FechaConcesionSolicitud = dto.FechaConcesionSolicitud.Value;

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*---------------------- Delete -----------------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
