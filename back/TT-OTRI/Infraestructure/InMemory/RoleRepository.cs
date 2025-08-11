// ============================================================================
// File: Infrastructure/InMemory/RoleRepository.cs
// Implementación en memoria del repositorio de roles (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

/// <summary>
/// Repositorio InMemory para Roles (para Provider=InMemory).
/// </summary>
public class RoleRepository : IRoleRepository
{
    // Seed base para pruebas
    private readonly List<Role> _store = new()
    {
        new Role { Id = 1, Nombre = "Administrador del sistema" },
        new Role { Id = 2, Nombre = "Administrador del contrato" },
        new Role { Id = 3, Nombre = "Gestor OTRI" },
        new Role { Id = 4, Nombre = "Autores/Inventores" },
        new Role { Id = 5, Nombre = "Autoridades" },
        new Role { Id = 6, Nombre = "Director OTRI" },
        new Role { Id = 7, Nombre = "Gerencia jurídica" },
        new Role { Id = 8, Nombre = "Financiero" }
    };

    /// <summary>Devuelve todos los roles.</summary>
    public Task<IEnumerable<Role>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    /// <summary>Devuelve un rol por Id.</summary>
    public Task<Role?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(r => r.Id == id));

    /// <summary>Inserta un rol.</summary>
    public Task AddAsync(Role entity, CancellationToken ct = default)
    {
        entity.Id = _store.Any() ? _store.Max(r => r.Id) + 1 : 1;
        entity.CreatedAt = entity.UpdatedAt = DateTime.UtcNow;
        _store.Add(entity);
        return Task.CompletedTask;
    }

    /// <summary>Actualiza un rol existente.</summary>
    public Task UpdateAsync(Role entity, CancellationToken ct = default)
    {
        var idx = _store.FindIndex(r => r.Id == entity.Id);
        if (idx >= 0) _store[idx] = entity;
        return Task.CompletedTask;
    }

    /// <summary>Elimina un rol por Id.</summary>
    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var removed = _store.RemoveAll(r => r.Id == id) > 0;
        return Task.FromResult(removed);
    }
}
