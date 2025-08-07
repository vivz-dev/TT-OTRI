// -----------------------------------------------------------------------------
// File: Infrastructure/InMemory/DistributionResolutionRepository.cs
// Implementación temporal (singleton) que almacena distribuciones en memoria.
// -----------------------------------------------------------------------------
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class DistributionResolutionRepository : IDistributionResolutionRepository
{
    private readonly List<DistributionResolution> _store = new()
    {
        new()
        {
            Id = 1, ResolutionId = 1,
            MontoMaximo = 1m, MontoMinimo = 10000m,
            PorcSubtotalAutores = 0.5m, PorcSubtotalInstitut = 0.5m
        },
        new()
        {
            Id = 2, ResolutionId = 1,
            MontoMaximo = 10001m, MontoMinimo = 50000m,
            PorcSubtotalAutores = 0.5m, PorcSubtotalInstitut = 0.5m
        }
    };

    public Task<IEnumerable<DistributionResolution>> GetAllAsync(CancellationToken _)
        => Task.FromResult(_store.AsEnumerable());

    public Task<IEnumerable<DistributionResolution>> GetByResolutionAsync(
        int resolutionId, CancellationToken _)
        => Task.FromResult(_store.Where(d => d.ResolutionId == resolutionId).AsEnumerable());

    public Task<DistributionResolution?> GetByIdAsync(int id, CancellationToken _)
        => Task.FromResult(_store.FirstOrDefault(d => d.Id == id));

    public Task AddAsync(DistributionResolution entity, CancellationToken _)
    {
        entity.Id = _store.Any() ? _store.Max(d => d.Id) + 1 : 1;
        entity.CreatedAt = entity.UpdatedAt = DateTime.UtcNow;
        _store.Add(entity);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(DistributionResolution entity, CancellationToken _)
    {
        var idx = _store.FindIndex(d => d.Id == entity.Id);
        if (idx >= 0) _store[idx] = entity;
        return Task.CompletedTask;
    }
}