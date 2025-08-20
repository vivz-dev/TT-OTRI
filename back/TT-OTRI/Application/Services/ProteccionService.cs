using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class ProteccionService
{
    private readonly IProteccionRepository _repo;

    public ProteccionService(IProteccionRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<ProteccionReadDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(MapToDto);
    }

    public async Task<ProteccionReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity is null ? null : MapToDto(entity);
    }

    public async Task<int> CreateAsync(ProteccionCreateDto dto, CancellationToken ct)
    {
        var entity = new Proteccion
        {
            IdTecnologia = dto.IdTecnologia,
            IdTipoProteccion = dto.IdTipoProteccion,
            FechaSolicitud = dto.FechaSolicitud
        };
        return await _repo.AddAsync(entity, ct);
    }

    public async Task UpdateAsync(int id, ProteccionPatchDto dto, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null)
            throw new KeyNotFoundException($"Proteccion con id {id} no encontrada.");

        // Aplicar cambios parciales
        if (dto.IdTecnologia.HasValue)
            entity.IdTecnologia = dto.IdTecnologia.Value;
        if (dto.IdTipoProteccion.HasValue)
            entity.IdTipoProteccion = dto.IdTipoProteccion.Value;
        if (dto.FechaSolicitud.HasValue)
            entity.FechaSolicitud = dto.FechaSolicitud.Value;

        await _repo.UpdateAsync(entity, ct);
    }

    private static ProteccionReadDto MapToDto(Proteccion entity)
    {
        return new ProteccionReadDto
        {
            Id = entity.Id,
            IdTecnologia = entity.IdTecnologia,
            IdTipoProteccion = entity.IdTipoProteccion,
            FechaSolicitud = entity.FechaSolicitud,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}