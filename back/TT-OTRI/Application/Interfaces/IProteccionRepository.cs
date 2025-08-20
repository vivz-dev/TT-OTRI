using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IProteccionRepository
{
    Task<IEnumerable<Proteccion>> GetAllAsync(CancellationToken ct = default);
    Task<Proteccion?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> AddAsync(Proteccion proteccion, CancellationToken ct = default);
    Task UpdateAsync(Proteccion proteccion, CancellationToken ct = default);
}