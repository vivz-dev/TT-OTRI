// ============================================================================
// Application/Services/EspecialistaService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class EspecialistaService
{
    private readonly IEspecialistaRepository _repo;

    public EspecialistaService(IEspecialistaRepository repo)
    {
        _repo = repo;
    }

    public Task<IReadOnlyList<EspecialistaReadDto>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllAsync(ct);

    public Task<EspecialistaReadDto?> GetByIdAsync(int id, CancellationToken ct)
        => _repo.GetByIdAsync(id, ct);

    public async Task<int> CreateAsync(EspecialistaCreateDto dto, CancellationToken ct)
    {
        // Validaciones básicas
        if (string.IsNullOrWhiteSpace(dto.Tipo))
            dto.Tipo = "ADC";

        if (!IsValidTipo(dto.Tipo))
            throw new ArgumentException("El tipo debe ser 'ADC' o 'RTT'.");

        return await _repo.CreateAsync(dto, ct);
    }

    public async Task<bool> PatchAsync(int id, EspecialistaPatchDto dto, CancellationToken ct)
    {
        // Validación del tipo si se proporciona
        if (!string.IsNullOrWhiteSpace(dto.Tipo) && !IsValidTipo(dto.Tipo))
            throw new ArgumentException("El tipo debe ser 'ADC' o 'RTT'.");

        return await _repo.PatchAsync(id, dto, ct);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct)
        => _repo.DeleteAsync(id, ct);

    private static bool IsValidTipo(string tipo)
        => tipo == "ADC" || tipo == "RTT";
}