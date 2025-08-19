// // ============================================================================
// // File: Infrastructure/InMemory/TecnologiaRepository.cs
// // Repositorio InMemory para tecnologías (demo/desarrollo).
// // ============================================================================
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.InMemory;
//
// public class TecnologiaRepository : ITecnologiaRepository
// {
//     private readonly List<Tecnologia> _store = new()
//     {
//         new()
//         {
//             Id = 1, IdUsuario = 99, Titulo = "Tech Demo",
//             Descripcion = "Prototipo de tecnología",
//             Estado = TechnologyStatus.Disponible,
//             Completed = false, Cotitularidad = false
//         }
//     };
//
//     public Task<IEnumerable<Tecnologia>> GetAllAsync(CancellationToken ct = default)
//         => Task.FromResult(_store.AsEnumerable());
//
//     public Task<Tecnologia?> GetByIdAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));
//
//     public Task AddAsync(Tecnologia e, CancellationToken ct = default)
//     {
//         e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
//         e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
//         _store.Add(e);
//         return Task.CompletedTask;
//     }
//
//     public Task UpdateAsync(Tecnologia e, CancellationToken ct = default)
//     {
//         var i = _store.FindIndex(x => x.Id == e.Id);
//         if (i >= 0) _store[i] = e;
//         return Task.CompletedTask;
//     }
//
//     public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
// }