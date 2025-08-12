// ============================================================================
// File: Application/Interfaces/ITipoProteccionRepository.cs
// Contrato de repositorio para TipoProteccion.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ITipoProteccionRepository
{
    Task<IEnumerable<TipoProteccion>> GetAllAsync (CancellationToken ct = default);
    Task<TipoProteccion?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task<TipoProteccion?>             GetByNameAsync(string nombre, CancellationToken ct = default);
    Task AddAsync   (TipoProteccion entity, CancellationToken ct = default);
    Task UpdateAsync(TipoProteccion entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}