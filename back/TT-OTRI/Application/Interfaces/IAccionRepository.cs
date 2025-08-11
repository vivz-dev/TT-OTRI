// ============================================================================
// File: Application/Interfaces/IAccionRepository.cs
// Contrato de repositorio para Accion (CRUD + delete).
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IAccionRepository
{
    Task<IEnumerable<Accion>> GetAllAsync(CancellationToken ct = default);
    Task<Accion?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync   (Accion entity, CancellationToken ct = default);
    Task UpdateAsync(Accion entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}