// ============================================================================
// File: Infrastructure/InMemory/CotitularRepository.cs
// Repositorio InMemory para Cotitular (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class CotitularRepository : ICotitularRepository
{
    private readonly List<Cotitular> _store = new()
    {
        // Ejemplo: cotitularidad 1, institución 1, usuario 99
        new() { Id = 1, CotitularidadId = 1, CotitularInstitId = 1, IdUsuario = 99, PorcCotitularidad = 0.50m }
    };

    public Task<IEnumerable<Cotitular>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<Cotitular?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task<IEnumerable<Cotitular>> GetByCotitularidadAsync(int cotitularidadId, CancellationToken ct = default)
        => Task.FromResult(_store.Where(x => x.CotitularidadId == cotitularidadId).AsEnumerable());

    public Task<Cotitular?> GetByPairAsync(int cotitularidadId, int cotitularInstitId, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x =>
            x.CotitularidadId == cotitularidadId && x.CotitularInstitId == cotitularInstitId));

    public Task AddAsync(Cotitular e, CancellationToken ct = default)
    {
        e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
        _store.Add(e);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Cotitular e, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == e.Id);
        if (i >= 0) _store[i] = e;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}
