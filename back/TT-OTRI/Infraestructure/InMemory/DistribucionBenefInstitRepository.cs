// ============================================================================
// File: Infrastructure/InMemory/DistribucionBenefInstitRepository.cs
// Repositorio InMemory para DistribucionBenefInstit (demo/desarrollo).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class DistribucionBenefInstitRepository : IDistribucionBenefInstitRepository
{
    private readonly List<DistribucionBenefInstit> _store = new()
    {
        new() { Id = 1, DistribucionResolucionId = 1, BeneficiarioInstitucionId = 1, Porcentaje = 0.6m },
        new() { Id = 2, DistribucionResolucionId = 1, BeneficiarioInstitucionId = 2, Porcentaje = 0.4m }
    };

    public Task<IEnumerable<DistribucionBenefInstit>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<IEnumerable<DistribucionBenefInstit>> GetByDistribucionAsync(int distribucionId, CancellationToken ct = default)
        => Task.FromResult(_store.Where(x => x.DistribucionResolucionId == distribucionId).AsEnumerable());

    public Task<DistribucionBenefInstit?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));

    public Task<DistribucionBenefInstit?> GetByPairAsync(int distribucionId, int beneficiarioId, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(x => x.DistribucionResolucionId == distribucionId &&
                                                      x.BeneficiarioInstitucionId == beneficiarioId));

    public Task AddAsync(DistribucionBenefInstit e, CancellationToken ct = default)
    {
        e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
        e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
        _store.Add(e);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(DistribucionBenefInstit e, CancellationToken ct = default)
    {
        var i = _store.FindIndex(x => x.Id == e.Id);
        if (i >= 0) _store[i] = e;
        return Task.CompletedTask;
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
}
