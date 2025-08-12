// ============================================================================
// File: Application/Interfaces/ICotitularInstitRepository.cs
// Contrato de repositorio para CotitularInstit.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ICotitularInstitRepository
{
    Task<IEnumerable<CotitularInstit>> GetAllAsync(CancellationToken ct = default);
    Task<CotitularInstit?>             GetByIdAsync(int id, CancellationToken ct = default);
    Task<CotitularInstit?>             GetByRucAsync(string ruc, CancellationToken ct = default);
    Task<CotitularInstit?>             GetByCorreoAsync(string correo, CancellationToken ct = default);
    Task AddAsync   (CotitularInstit entity, CancellationToken ct = default);
    Task UpdateAsync(CotitularInstit entity, CancellationToken ct = default);
    Task<bool>      DeleteAsync(int id, CancellationToken ct = default);
}