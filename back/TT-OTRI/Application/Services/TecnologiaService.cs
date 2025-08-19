using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class TecnologiaService
{
    private readonly ITecnologiaRepository _repo;

    public TecnologiaService(ITecnologiaRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<TecnologiaReadDto>> GetAllAsync(CancellationToken ct)
    {
        var tecnologias = await _repo.GetAllAsync(ct);
        return tecnologias.Select(MapToDto);
    }

    public async Task<TecnologiaReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var tecnologia = await _repo.GetByIdAsync(id, ct);
        return tecnologia is null ? null : MapToDto(tecnologia);
    }

    public async Task<int> CreateAsync(TecnologiaCreateDto dto, CancellationToken ct)
    {
        var entity = new Tecnologia
        {
            IdPersona = dto.IdPersona,
            Completado = dto.Completado,
            Cotitularidad = dto.Cotitularidad,
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            Estado = dto.Estado
        };

        await _repo.AddAsync(entity, ct);
        return entity.Id;
    }

    public async Task UpdateAsync(int id, TecnologiaPatchDto dto, CancellationToken ct)
    {
        var existing = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Tecnología con ID {id} no encontrada");

        if (dto.IdPersona.HasValue) existing.IdPersona = dto.IdPersona.Value;
        if (dto.Completado.HasValue) existing.Completado = dto.Completado.Value;
        if (dto.Cotitularidad.HasValue) existing.Cotitularidad = dto.Cotitularidad.Value;
        if (dto.Titulo is not null) existing.Titulo = dto.Titulo;
        if (dto.Descripcion is not null) existing.Descripcion = dto.Descripcion;
        if (dto.Estado.HasValue) existing.Estado = dto.Estado.Value;

        await _repo.UpdateAsync(existing, ct);
    }

    private static TecnologiaReadDto MapToDto(Tecnologia t)
    {
        return new TecnologiaReadDto
        {
            Id = t.Id,
            IdPersona = t.IdPersona,
            Completado = t.Completado,
            Cotitularidad = t.Cotitularidad,
            Titulo = t.Titulo,
            Descripcion = t.Descripcion,
            Estado = t.Estado,
            FechaCreacion = t.FechaCreacion,
            UltimoCambio = t.UltimoCambio
        };
    }
}