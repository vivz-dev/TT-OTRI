// ============================================================================
// File: Application/Services/UserRoleService.cs
// Lógica de negocio para listar, crear, patch y borrar Usuario–Rol.
// Valida FKs (Usuario y Rol) y evita duplicados (UsuarioId, RoleId).
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class UserRoleService
{
    private readonly IUserRoleRepository _repo;
    private readonly IUserRepository     _userRepo;
    private readonly IRoleRepository     _roleRepo;

    public UserRoleService(IUserRoleRepository repo, IUserRepository userRepo, IRoleRepository roleRepo)
    {
        _repo = repo; _userRepo = userRepo; _roleRepo = roleRepo;
    }

    /*---------------- Lectura ----------------*/
    public Task<IEnumerable<UserRole>> ListAsync() => _repo.GetAllAsync();
    public Task<IEnumerable<UserRole>> ListByUserAsync(int usuarioId) => _repo.GetByUserAsync(usuarioId);
    public Task<UserRole?> GetAsync(int id) => _repo.GetByIdAsync(id);

    /*---------------- Creación ---------------*/
    public async Task<UserRole?> CreateAsync(UserRoleCreateDto dto)
    {
        // Validación de FKs
        if (await _userRepo.GetByIdAsync(dto.UsuarioId) is null) return null;
        if (await _roleRepo.GetByIdAsync(dto.RoleId)     is null) return null;

        // Evita duplicados
        if (await _repo.GetByUserAndRoleAsync(dto.UsuarioId, dto.RoleId) is not null) return null;

        var entity = new UserRole
        {
            UsuarioId = dto.UsuarioId,
            RoleId    = dto.RoleId
        };
        await _repo.AddAsync(entity);
        return entity;
    }

    /*---------------- Patch ------------------*/
    public async Task<bool> PatchAsync(int id, UserRolePatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (dto.UsuarioId.HasValue)
        {
            if (await _userRepo.GetByIdAsync(dto.UsuarioId.Value) is null) return false;
            e.UsuarioId = dto.UsuarioId.Value;
        }

        if (dto.RoleId.HasValue)
        {
            if (await _roleRepo.GetByIdAsync(dto.RoleId.Value) is null) return false;
            e.RoleId = dto.RoleId.Value;
        }

        // Evita duplicados si ambas claves están definidas
        if (await _repo.GetByUserAndRoleAsync(e.UsuarioId, e.RoleId) is { } dup && dup.Id != e.Id)
            return false;

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*---------------- Delete -----------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
