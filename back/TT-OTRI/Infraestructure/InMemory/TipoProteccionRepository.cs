// // ============================================================================
// // File: Infrastructure/InMemory/TipoProteccionRepository.cs
// // Repositorio InMemory para TipoProteccion (demo/desarrollo).
// // ============================================================================
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.InMemory;
//
// public class TipoProteccionRepository : ITipoProteccionRepository
// {
//     private readonly List<TipoProteccion> _store = new()
//     {
//         new() { Id = 1, Nombre = "Secreto Empresarial" },
//         new() { Id = 2, Nombre = "Derecho de autor" },
//         new() { Id = 3, Nombre = "Patente de invención" },
//         new() { Id = 4, Nombre = "Modelo de utilidad" },
//         new() { Id = 5, Nombre = "Diseño industrial" },
//         new() { Id = 6, Nombre = "Nuevas obtenciones de variedad vegetal" },
//         new() { Id = 7, Nombre = "Signos distintivos" },
//         new() { Id = 8, Nombre = "No aplica" }
//     };
//
//     public Task<IEnumerable<TipoProteccion>> GetAllAsync(CancellationToken ct = default)
//         => Task.FromResult(_store.AsEnumerable());
//
//     public Task<TipoProteccion?> GetByIdAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));
//
//     public Task<TipoProteccion?> GetByNameAsync(string nombre, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x => 
//                string.Equals(x.Nombre, nombre, StringComparison.OrdinalIgnoreCase)));
//
//     public Task AddAsync(TipoProteccion e, CancellationToken ct = default)
//     {
//         e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
//         e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
//         _store.Add(e);
//         return Task.CompletedTask;
//     }
//
//     public Task UpdateAsync(TipoProteccion e, CancellationToken ct = default)
//     {
//         var i = _store.FindIndex(x => x.Id == e.Id);
//         if (i >= 0) _store[i] = e;
//         return Task.CompletedTask;
//     }
//
//     public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
// }
