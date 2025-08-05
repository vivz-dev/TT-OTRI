using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class ResolutionRepository : IResolutionRepository
{
    // Semilla de prueba
    private readonly List<Resolution> _store = new()
    {
        new() { Titulo = "Resolución 001-TT-2025", Estado = ResolutionStatus.Vigente, Completed = true },
        new() { Titulo = "Resolución 002-TT-2025", Estado = ResolutionStatus.Borrador }
    };

    public Task<IEnumerable<Resolution>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());
}