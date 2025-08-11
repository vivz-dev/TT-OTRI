// ============================================================================
// File: Infrastructure/InMemory/PermisoRepository.cs
// Repositorio InMemory para Permiso (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class PermisoRepository : IPermisoRepository
{
    private readonly List<Permiso> _store = new()
    {
        new() { Id = 1, RoleId = 1, AccionId = 1, Visualizar = true, Editar = true },
        new() { Id = 2, RoleId = 1, AccionId = 2, Visualizar = true },
        new() { Id = 3, RoleId = 3, AccionId = 1, Visualizar = true }
    };

    public Task<IEnumerable<Permiso>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<IEnumerable<Permiso>> GetByRoleAsync(int roleId, CancellationToken ct = default)
        => Task.FromResult(_store.Where(x => x.RoleId == roleId).AsEnumerable());

    public Task<Permiso?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task<Permiso?> GetByRoleAndAccionAsync(int roleId, int accionId, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.RoleId == roleId && x.AccionId == accionId));

    public Task AddAsync(Permiso e, CancellationToken ct = default)
    {
        e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
        _store.Add(e);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Permiso e, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == e.Id);
        if (i >= 0) _store[i] = e;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}