// ============================================================================
// File: Infrastructure/InMemory/AccionRepository.cs
// Repositorio InMemory para Accion (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class AccionRepository : IAccionRepository
{
    private readonly List<Accion> _store = new()
    {
        new() { Id = 1, Nombre = "Resoluciones" },
        new() { Id = 2, Nombre = "Tecnologias/know-how" },
        new() { Id = 3, Nombre = "TT" },
        new() { Id = 4, Nombre = "Configuracion" },
        new() { Id = 5, Nombre = "Roles" },
        new() { Id = 6, Nombre = "Catalogos" },
        new() { Id = 7, Nombre = "Pagos" }
    };

    public Task<IEnumerable<Accion>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<Accion?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task AddAsync(Accion e, CancellationToken ct = default)
    {
        e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
        _store.Add(e);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Accion e, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == e.Id);
        if (i >= 0) _store[i] = e;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}