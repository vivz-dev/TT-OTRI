// ============================================================================
// Application/Services/TipoTransferTecnologicaService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class TipoTransferTecnologicaService
{
    private readonly ITipoTransferTecnologicaRepository _repo;

    public TipoTransferTecnologicaService(ITipoTransferTecnologicaRepository repo)
    {
        _repo = repo;
    }

    private static string NormalizeNombre(string s)
    {
        s = (s ?? string.Empty).Trim();
        if (s.Length == 0) throw new ArgumentException("El nombre es obligatorio.");
        if (s.Length > 100) s = s.Substring(0, 100); // evita CLI0109E por longitud
        return s;
    }

    public async Task<IReadOnlyList<TipoTransferTTReadDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(MapToRead).ToList();
    }

    public async Task<TipoTransferTTReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var ent = await _repo.GetByIdAsync(id, ct);
        return ent is null ? null : MapToRead(ent);
    }

    public async Task<int> CreateAsync(TipoTransferTTCreateDto dto, CancellationToken ct)
    {
        var entity = new TipoTransferTecnologica
        {
            Nombre = NormalizeNombre(dto.Nombre)
        };
        return await _repo.CreateAsync(entity, ct);
    }

    public async Task<bool> PatchAsync(int id, TipoTransferTTPatchDto dto, CancellationToken ct)
    {
        string? nombre = dto.Nombre is null ? null : NormalizeNombre(dto.Nombre);
        return await _repo.PatchAsync(id, nombre, ct);
    }

    private static TipoTransferTTReadDto MapToRead(TipoTransferTecnologica e) => new()
    {
        Id        = e.Id,
        Nombre    = e.Nombre,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };
}
