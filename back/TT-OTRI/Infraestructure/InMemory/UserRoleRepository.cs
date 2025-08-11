// ============================================================================
// File: Infrastructure/InMemory/UserRoleRepository.cs
// Repositorio InMemory para la relación Usuario–Rol.
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class UserRoleRepository : IUserRoleRepository
{
    private readonly List<UserRole> _store = new()
    {
        new UserRole { Id = 1, UsuarioId = 101, RoleId = 1 },
        new UserRole { Id = 2, UsuarioId = 102, RoleId = 3 },
    };

    public Task<IEnumerable<UserRole>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<IEnumerable<UserRole>> GetByUserAsync(int usuarioId, CancellationToken ct = default)
        => Task.FromResult(_store.Where(x => x.UsuarioId == usuarioId).AsEnumerable());

    public Task<UserRole?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task<UserRole?> GetByUserAndRoleAsync(int usuarioId, int roleId, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.UsuarioId == usuarioId && x.RoleId == roleId));

    public Task AddAsync(UserRole entity, CancellationToken ct = default)
    {
        entity.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        entity.CreatedAt = entity.UpdatedAt = DateTime.UtcNow;
        _store.Add(entity);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(UserRole entity, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == entity.Id);
        if (i >= 0) _store[i] = entity;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}