// ============================================================================
// Application/Services/LicenciamientoService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class LicenciamientoService
{
    private readonly ILicenciamientoRepository _repo;

    public LicenciamientoService(ILicenciamientoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<LicenciamientoReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        var licenciamientos = await _repo.GetAllAsync(ct);
        return licenciamientos.Select(MapToReadDto);
    }

    public async Task<LicenciamientoReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var licenciamiento = await _repo.GetByIdAsync(id, ct);
        return licenciamiento != null ? MapToReadDto(licenciamiento) : null;
    }

    public async Task<LicenciamientoReadDto> CreateAsync(LicenciamientoCreateDto dto, CancellationToken ct = default)
    {
        var licenciamiento = new Licenciamiento
        {
            IdTransferTecnologica = dto.IdTransferTecnologica,
            SubLicenciamiento = dto.SubLicenciamiento,
            FechaLimite = dto.FechaLimite
        };

        await _repo.AddAsync(licenciamiento, ct);
        return MapToReadDto(licenciamiento);
    }

    public async Task<bool> UpdateAsync(int id, LicenciamientoPatchDto dto, CancellationToken ct = default)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing == null)
            return false;

        // Aplicar cambios parciales
        if (dto.IdTransferTecnologica.HasValue)
            existing.IdTransferTecnologica = dto.IdTransferTecnologica.Value;

        if (dto.SubLicenciamiento.HasValue)
            existing.SubLicenciamiento = dto.SubLicenciamiento.Value;

        if (dto.FechaLimite.HasValue)
            existing.FechaLimite = dto.FechaLimite.Value;

        await _repo.UpdateAsync(existing, ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing == null)
            return false;

        await _repo.DeleteAsync(id, ct);
        return true;
    }

    private static LicenciamientoReadDto MapToReadDto(Licenciamiento licenciamiento)
    {
        return new LicenciamientoReadDto
        {
            Id = licenciamiento.Id,
            IdTransferTecnologica = licenciamiento.IdTransferTecnologica,
            SubLicenciamiento = licenciamiento.SubLicenciamiento,
            FechaLimite = licenciamiento.FechaLimite,
            CreatedAt = licenciamiento.CreatedAt,
            UpdatedAt = licenciamiento.UpdatedAt
        };
    }
}