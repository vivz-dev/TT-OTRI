// // ============================================================================
// // File: Infrastructure/InMemory/CotitularInstitRepository.cs
// // Repositorio InMemory (demo/desarrollo) para CotitularInstit.
// // ============================================================================
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.InMemory;
//
// public class CotitularInstitRepository : ICotitularInstitRepository
// {
//     private readonly List<CotitularInstit> _store = new()
//     {
//         new() { Id = 1, Nombre = "OTRI",     Correo = "contacto@otri.ec",  Ruc = "0999999999001" },
//         new() { Id = 2, Nombre = "ESPOL",    Correo = "info@espol.edu.ec", Ruc = "1799999999001" },
//         new() { Id = 3, Nombre = "Unidad X", Correo = "",                  Ruc = "" }
//     };
//
//     public Task<IEnumerable<CotitularInstit>> GetAllAsync(CancellationToken ct = default)
//         => Task.FromResult(_store.AsEnumerable());
//
//     public Task<CotitularInstit?> GetByIdAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x => x.Id == id));
//
//     public Task<CotitularInstit?> GetByRucAsync(string ruc, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x =>
//                !string.IsNullOrEmpty(x.Ruc) &&
//                string.Equals(x.Ruc, ruc, StringComparison.OrdinalIgnoreCase)));
//
//     public Task<CotitularInstit?> GetByCorreoAsync(string correo, CancellationToken ct = default)
//         => Task.FromResult(_store.FirstOrDefault(x =>
//                !string.IsNullOrEmpty(x.Correo) &&
//                string.Equals(x.Correo, correo, StringComparison.OrdinalIgnoreCase)));
//
//     public Task AddAsync(CotitularInstit e, CancellationToken ct = default)
//     {
//         e.Id = _store.Any() ? _store.Max(x => x.Id) + 1 : 1;
//         e.CreatedAt = e.UpdatedAt = DateTime.UtcNow;
//         _store.Add(e);
//         return Task.CompletedTask;
//     }
//
//     public Task UpdateAsync(CotitularInstit e, CancellationToken ct = default)
//     {
//         var i = _store.FindIndex(x => x.Id == e.Id);
//         if (i >= 0) _store[i] = e;
//         return Task.CompletedTask;
//     }
//
//     public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
//         => Task.FromResult(_store.RemoveAll(x => x.Id == id) > 0);
// }
