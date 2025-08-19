using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class TipoProteccionService
{
    private readonly ITipoProteccionRepository _repo;

    public TipoProteccionService(ITipoProteccionRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<TipoProteccionReadDto>> GetAllAsync(CancellationToken ct)
    {
        var tipos = await _repo.GetAllAsync(ct);
        return tipos.Select(MapToReadDto);
    }

    public async Task<TipoProteccionReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var tipo = await _repo.GetByIdAsync(id, ct);
        return tipo is null ? null : MapToReadDto(tipo);
    }

    public async Task<int> CreateAsync(TipoProteccionCreateDto dto, CancellationToken ct)
    {
        var tipo = new TipoProteccion { Nombre = dto.Nombre };
        return await _repo.CreateAsync(tipo, ct);
    }

    public async Task UpdateAsync(int id, TipoProteccionPatchDto dto, CancellationToken ct)
    {
        var tipo = await _repo.GetByIdAsync(id, ct);
        if (tipo is null) throw new KeyNotFoundException($"TipoProteccion {id} no encontrado.");

        if (!string.IsNullOrWhiteSpace(dto.Nombre))
            tipo.Nombre = dto.Nombre;

        await _repo.UpdateAsync(tipo, ct);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken ct)
        => _repo.DeleteAsync(id, ct);

    private static TipoProteccionReadDto MapToReadDto(TipoProteccion tipo)
    {
        return new TipoProteccionReadDto
        {
            Id = tipo.Id,
            Nombre = tipo.Nombre,
            CreatedAt = tipo.CreatedAt,
            UpdatedAt = tipo.UpdatedAt
        };
    }
}