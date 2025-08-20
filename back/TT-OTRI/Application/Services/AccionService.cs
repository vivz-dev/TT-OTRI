// ============================================================================
// Application/Services/AccionService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class AccionService
{
    private readonly IAccionRepository _repo;

    public AccionService(IAccionRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<AccionReadDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(Map).ToList();
    }

    public async Task<AccionReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var a = await _repo.GetByIdAsync(id, ct);
        return a is null ? null : Map(a);
    }

    public async Task<int> CreateAsync(AccionCreateDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            throw new ArgumentException("Nombre es requerido.");

        var a = new Accion { Nombre = dto.Nombre.Trim() };
        var id = await _repo.CreateAsync(a, ct);
        return id;
    }

    public async Task<bool> PatchAsync(int id, AccionPatchDto dto, CancellationToken ct)
    {
        if (dto.Nombre is string s && string.IsNullOrWhiteSpace(s))
            throw new ArgumentException("Si se envía Nombre, no puede ser vacío.");

        return await _repo.PatchAsync(id, dto.Nombre?.Trim(), ct);
    }

    private static AccionReadDto Map(Accion a) => new()
    {
        Id        = a.IdAccion,
        Nombre    = a.Nombre,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
}