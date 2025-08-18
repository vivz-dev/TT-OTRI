// // ============================================================================
// // File: Infrastructure/InMemory/DistribucionResolucionRepository.cs
// // Implementación temporal (singleton) que almacena distribuciones en memoria.
// // Este repositorio in-memory permite probar la lógica de negocio y los
// // controladores sin depender de una base de datos real. En producción debe
// // sustituirse por una implementación basada en DB2/EF Core.
// // ============================================================================
//
// using TT_OTRI.Application.Interfaces;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Infrastructure.InMemory;
//
// /// <summary>
// /// Implementación en memoria de <see cref="IDistribucionResolucionRepository"/>.
// /// Gestiona colecciones de <see cref="DistributionResolution"/> con operaciones
// /// CRUD básicas sobre una lista interna.
// /// </summary>
// public class DistribucionResolucionRepository : IDistribucionResolucionRepository
// {
//     // ---------------------------------------------------------------------
//     // Almacenamiento en memoria
//     // - Lista inicial con dos tramos de ejemplo asociados a ResolutionId = 1.
//     //   *Nota:* Los valores son solo de demostración.
//     // ---------------------------------------------------------------------
//     private readonly List<DistributionResolution> _store = new()
//     {
//         new()
//         {
//             Id = 1, ResolutionId = 1,
//             MontoMaximo = 1m, MontoMinimo = 10000m,
//             PorcSubtotalAutores = 0.5m, PorcSubtotalInstitut = 0.5m
//         },
//         new()
//         {
//             Id = 2, ResolutionId = 1,
//             MontoMaximo = 10001m, MontoMinimo = 50000m,
//             PorcSubtotalAutores = 0.5m, PorcSubtotalInstitut = 0.5m
//         }
//     };
//
//     /// <summary>
//     /// Obtiene todas las distribuciones almacenadas en memoria.
//     /// </summary>
//     /// <param name="_">Token de cancelación (no utilizado).</param>
//     /// <returns>Enumeración con todas las entidades.</returns>
//     public Task<IEnumerable<DistributionResolution>> GetAllAsync(CancellationToken _)
//         => Task.FromResult(_store.AsEnumerable());
//
//     /// <summary>
//     /// Obtiene todas las distribuciones de una resolución específica.
//     /// </summary>
//     /// <param name="resolutionId">Identificador de la resolución.</param>
//     /// <param name="_">Token de cancelación (no utilizado).</param>
//     /// <returns>Enumeración con las entidades filtradas por resolución.</returns>
//     public Task<IEnumerable<DistributionResolution>> GetByResolutionAsync(
//         int resolutionId, CancellationToken _)
//         => Task.FromResult(_store.Where(d => d.ResolutionId == resolutionId).AsEnumerable());
//
//     /// <summary>
//     /// Obtiene una distribución por su identificador.
//     /// </summary>
//     /// <param name="id">Identificador de la distribución.</param>
//     /// <param name="_">Token de cancelación (no utilizado).</param>
//     /// <returns>La entidad encontrada o <c>null</c> si no existe.</returns>
//     public Task<DistributionResolution?> GetByIdAsync(int id, CancellationToken _)
//         => Task.FromResult(_store.FirstOrDefault(d => d.Id == id));
//
//     /// <summary>
//     /// Agrega una nueva distribución al almacenamiento en memoria. Asigna un
//     /// identificador incremental y actualiza marcas de tiempo.
//     /// </summary>
//     /// <param name="entity">Entidad a agregar.</param>
//     /// <param name="_">Token de cancelación (no utilizado).</param>
//     public Task AddAsync(DistributionResolution entity, CancellationToken _)
//     {
//         entity.Id = _store.Any() ? _store.Max(d => d.Id) + 1 : 1;
//         entity.CreatedAt = entity.UpdatedAt = DateTime.UtcNow;
//         _store.Add(entity);
//         return Task.CompletedTask;
//     }
//
//     /// <summary>
//     /// Actualiza una distribución existente. Si no se encuentra por Id,
//     /// la operación no tiene efecto.
//     /// </summary>
//     /// <param name="entity">Entidad con los datos actualizados.</param>
//     /// <param name="_">Token de cancelación (no utilizado).</param>
//     public Task UpdateAsync(DistributionResolution entity, CancellationToken _)
//     {
//         var idx = _store.FindIndex(d => d.Id == entity.Id);
//         if (idx >= 0) _store[idx] = entity;
//         return Task.CompletedTask;
//     }
// }
