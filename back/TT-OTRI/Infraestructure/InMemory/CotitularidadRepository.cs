// // ============================================================================
// // File: Infrastructure/InMemory/CotitularidadRepository.cs
// // Repositorio InMemory para Cotitularidad (demo/desarrollo).
// // ============================================================================
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.InMemory;
//
// public class CotitularidadRepository : ICotitularidadRepository
// {
//     private readonly List<Cotitularidad> _store = new()
//     {
//         // Ejemplo inicial: la tecnología 1 tiene cotitularidad
//         new() { Id = 1, TechnologyId = 1 }
//     };
//
//     public Task<IEnumerable<Cotitularidad>> GetAllAsync(CancellationToken ct = default)
//         => Task.FromResult(_store.AsEnumerable());
//
//     public Task<Cotitularidad?> GetByIdAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));
//
//     public Task<Cotitularidad?> GetByTechnologyAsync(int technologyId, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x => x.TechnologyId == technologyId));
//
//     public Task AddAsync(Cotitularidad e, CancellationToken ct = default)
//     {
//         e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
//         e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
//         _store.Add(e);
//         return Task.CompletedTask;
//     }
//
//     public Task UpdateAsync(Cotitularidad e, CancellationToken ct = default)
//     {
//         var i = _store.FindIndex(x => x.Id == e.Id);
//         if (i >= 0) _store[i] = e;
//         return Task.CompletedTask;
//     }
//
//     public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
// }