// ============================================================================
// File: Application/Services/RoleService.cs
// Lógica de negocio para listar, obtener, crear, actualizar y eliminar roles.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

/// <summary>
/// Servicio de aplicación para Roles.
/// </summary>
public class RoleService
{
    private readonly IRoleRepository _repo;
    /// <summary>Constructor.</summary>
    public RoleService(IRoleRepository repo) => _repo = repo;

    /*----------------- Lectura -----------------*/
    /// <summary>Lista todos los roles.</summary>
    public Task<IEnumerable<Role>> ListAsync() => _repo.GetAllAsync();

    /// <summary>Obtiene un rol por Id.</summary>
    public Task<Role?> GetAsync(int id) => _repo.GetByIdAsync(id);

    /*----------------- Creación ----------------*/
    /// <summary>Crea un rol nuevo.</summary>
    public async Task<Role?> CreateAsync(RoleCreateDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Nombre)) return null;
        var e = new Role { Nombre = dto.Nombre.Trim() };
        await _repo.AddAsync(e);
        return e;
    }

    /*----------------- Patch -------------------*/
    /// <summary>Actualiza parcialmente un rol existente.</summary>
    public async Task<bool> PatchAsync(int id, RolePatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.Nombre))
            e.Nombre = dto.Nombre.Trim();

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*----------------- Delete ------------------*/
    /// <summary>Elimina un rol por Id.</summary>
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}