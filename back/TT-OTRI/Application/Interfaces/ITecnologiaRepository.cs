using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ITecnologiaRepository
{
    Task<IEnumerable<Tecnologia>> GetAllAsync(CancellationToken ct = default);
    Task<Tecnologia?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(Tecnologia tecnologia, CancellationToken ct = default);
    Task UpdateAsync(Tecnologia tecnologia, CancellationToken ct = default);
}