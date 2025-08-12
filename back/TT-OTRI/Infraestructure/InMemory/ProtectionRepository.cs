// ============================================================================
// File: Infrastructure/InMemory/ProtectionRepository.cs
// Repositorio InMemory para Protection (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class ProtectionRepository : IProtectionRepository
{
    private readonly List<Protection> _store = new()
    {
        // Ejemplo: TechId=1 con TipoProteccionId=3 (Patente)
        new() { Id = 1, TechnologyId = 1, TipoProteccionId = 3, FechaConcesionSolicitud = null }
    };

    public Task<IEnumerable<Protection>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<IEnumerable<Protection>> GetByTechnologyAsync(int technologyId, CancellationToken ct = default)
        => Task.FromResult(_store.Where(x => x.TechnologyId == technologyId).AsEnumerable());

    public Task<Protection?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task<Protection?> GetByPairAsync(int technologyId, int tipoProteccionId, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.TechnologyId == technologyId && x.TipoProteccionId == tipoProteccionId));

    public Task AddAsync(Protection e, CancellationToken ct = default)
    {
        e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
        _store.Add(e);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Protection e, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == e.Id);
        if (i >= 0) _store[i] = e;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}
