// ============================================================================
// File: Infrastructure/InMemory/BeneficiarioInstitucionRepository.cs
// Repositorio InMemory para BeneficiarioInstitucion (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class BeneficiarioInstitucionRepository : IBeneficiarioInstitucionRepository
{
    private readonly List<BeneficiarioInstitucion> _store = new()
    {
        new() { Id = 1, Nombre = "OTRI" },
        new() { Id = 2, Nombre = "ESPOL" },
        new() { Id = 3, Nombre = "Unidades/Centros" }
    };

    public Task<IEnumerable<BeneficiarioInstitucion>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<BeneficiarioInstitucion?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task AddAsync(BeneficiarioInstitucion e, CancellationToken ct = default)
    {
        e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
        _store.Add(e);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(BeneficiarioInstitucion e, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == e.Id);
        if (i >= 0) _store[i] = e;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}