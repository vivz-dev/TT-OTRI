// ============================================================================
// Application/Services/AutorService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class AutorService
{
    private readonly IAutorRepository _repo;

    public AutorService(IAutorRepository repo)
    {
        _repo = repo;
    }

    public Task<IReadOnlyList<AutorReadDto>> GetAllAsync(CancellationToken ct = default)
        => _repo.GetAllAsync(ct);

    public Task<AutorReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
        => _repo.GetByIdAsync(id, ct);

    public Task<IReadOnlyList<AutorReadDto>> GetByAcuerdoDistribAsync(int idAcuerdoDistrib, CancellationToken ct = default)
        => _repo.GetByAcuerdoDistribAsync(idAcuerdoDistrib, ct);

    public Task<IReadOnlyList<AutorReadDto>> GetByUnidadAsync(int idUnidad, CancellationToken ct = default)
        => _repo.GetByUnidadAsync(idUnidad, ct);

    public Task<IReadOnlyList<AutorReadDto>> GetByPersonaAsync(int idPersona, CancellationToken ct = default)
        => _repo.GetByPersonaAsync(idPersona, ct);

    public async Task<int> CreateAsync(AutorCreateDto dto, CancellationToken ct = default)
    {
        // Validaciones básicas de negocio
        if (dto.PorcAutor.HasValue && (dto.PorcAutor < 0 || dto.PorcAutor > 1))
            throw new ArgumentException("El porcentaje del autor debe estar entre 0 y 1.");

        if (dto.PorcUnidad.HasValue && (dto.PorcUnidad < 0 || dto.PorcUnidad > 1))
            throw new ArgumentException("El porcentaje de la unidad debe estar entre 0 y 1.");

        return await _repo.CreateAsync(dto, ct);
    }

    public async Task<bool> PatchAsync(int id, AutorPatchDto dto, CancellationToken ct = default)
    {
        // Validaciones básicas de negocio
        if (dto.PorcAutor.HasValue && (dto.PorcAutor < 0 || dto.PorcAutor > 1))
            throw new ArgumentException("El porcentaje del autor debe estar entre 0 y 1.");

        if (dto.PorcUnidad.HasValue && (dto.PorcUnidad < 0 || dto.PorcUnidad > 1))
            throw new ArgumentException("El porcentaje de la unidad debe estar entre 0 y 1.");

        return await _repo.PatchAsync(id, dto, ct);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        => _repo.DeleteAsync(id, ct);
}