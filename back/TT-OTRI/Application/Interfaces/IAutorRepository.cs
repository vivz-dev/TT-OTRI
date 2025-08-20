// ============================================================================
// Application/Interfaces/IAutorRepository.cs
// ============================================================================
using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IAutorRepository
{
    Task<IReadOnlyList<AutorReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<AutorReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<AutorReadDto>> GetByAcuerdoDistribAsync(int idAcuerdoDistrib, CancellationToken ct = default);
    Task<IReadOnlyList<AutorReadDto>> GetByUnidadAsync(int idUnidad, CancellationToken ct = default);
    Task<IReadOnlyList<AutorReadDto>> GetByPersonaAsync(int idPersona, CancellationToken ct = default);
    Task<int> CreateAsync(AutorCreateDto dto, CancellationToken ct = default);
    Task<bool> PatchAsync(int id, AutorPatchDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}