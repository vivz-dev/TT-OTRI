using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ITipoProteccionRepository
{
    Task<IEnumerable<TipoProteccion>> GetAllAsync(CancellationToken ct = default);
    Task<TipoProteccion?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(TipoProteccion tipo, CancellationToken ct = default);
    Task UpdateAsync(TipoProteccion tipo, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}