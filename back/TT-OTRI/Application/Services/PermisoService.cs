// ============================================================================
// File: Application/Services/PermisoService.cs
// Orquesta la lógica para listar, crear, patch y borrar permisos.
// Valida FKs (Rol y Acción) y evita duplicados (RoleId, AccionId).
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class PermisoService
{
    private readonly IPermisoRepository _repo;
    private readonly IRoleRepository    _roleRepo;
    private readonly IAccionRepository  _accionRepo;

    public PermisoService(IPermisoRepository repo, IRoleRepository roleRepo, IAccionRepository accionRepo)
    {
        _repo = repo; _roleRepo = roleRepo; _accionRepo = accionRepo;
    }

    /*---------------- Lectura ----------------*/
    public Task<IEnumerable<Permiso>> ListAsync() => _repo.GetAllAsync();
    public Task<IEnumerable<Permiso>> ListByRoleAsync(int roleId) => _repo.GetByRoleAsync(roleId);
    public Task<Permiso?> GetAsync(int id) => _repo.GetByIdAsync(id);

    /*---------------- Creación ---------------*/
    public async Task<Permiso?> CreateAsync(PermisoCreateDto dto)
    {
        if (await _roleRepo.GetByIdAsync(dto.RoleId) is null) return null;
        if (await _accionRepo.GetByIdAsync(dto.AccionId) is null) return null;
        if (await _repo.GetByRoleAndAccionAsync(dto.RoleId, dto.AccionId) is not null) return null;

        var e = new Permiso
        {
            RoleId     = dto.RoleId,
            AccionId   = dto.AccionId,
            Visualizar = dto.Visualizar,
            Editar     = dto.Editar,
            Inhabilitar= dto.Inhabilitar,
            Crear      = dto.Crear
        };
        await _repo.AddAsync(e);
        return e;
    }

    /*---------------- Patch ------------------*/
    public async Task<bool> PatchAsync(int id, PermisoPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (dto.RoleId.HasValue)
        {
            if (await _roleRepo.GetByIdAsync(dto.RoleId.Value) is null) return false;
            e.RoleId = dto.RoleId.Value;
        }

        if (dto.AccionId.HasValue)
        {
            if (await _accionRepo.GetByIdAsync(dto.AccionId.Value) is null) return false;
            e.AccionId = dto.AccionId.Value;
        }

        // evita duplicados del par (role, accion)
        if (await _repo.GetByRoleAndAccionAsync(e.RoleId, e.AccionId) is { } dup && dup.Id != e.Id)
            return false;

        if (dto.Visualizar.HasValue)  e.Visualizar  = dto.Visualizar.Value;
        if (dto.Editar.HasValue)      e.Editar      = dto.Editar.Value;
        if (dto.Inhabilitar.HasValue) e.Inhabilitar = dto.Inhabilitar.Value;
        if (dto.Crear.HasValue)       e.Crear       = dto.Crear.Value;

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*---------------- Delete -----------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
