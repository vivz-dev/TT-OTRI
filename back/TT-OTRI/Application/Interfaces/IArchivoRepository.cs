using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IArchivoRepository
{
    Task<IReadOnlyList<Archivo>> GetAllAsync(CancellationToken ct = default);
    Task<Archivo?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<int> CreateAsync(Archivo entity, CancellationToken ct = default);
    Task<bool> UpdatePartialAsync(int id, Archivo patch, CancellationToken ct = default);
}