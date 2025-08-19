using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class CotitularService
{
    private readonly ICotitularRepository _repository;

    public CotitularService(ICotitularRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CotitularReadDto>> GetAllAsync(CancellationToken ct)
    {
        var cotitulares = await _repository.GetAllAsync(ct);
        return cotitulares.Select(MapToDto);
    }

    public async Task<CotitularReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var cotitular = await _repository.GetByIdAsync(id, ct);
        return cotitular != null ? MapToDto(cotitular) : null;
    }

    public async Task<int> CreateAsync(CotitularCreateDto dto, CancellationToken ct)
    {
        var cotitular = new Cotitular
        {
            IdCotitularidadTecno = dto.IdCotitularidadTecno,
            IdCotitularidadInst = dto.IdCotitularidadInst,
            IdPersona = dto.IdPersona,
            Porcentaje = dto.Porcentaje
        };

        return await _repository.AddAsync(cotitular, ct);
    }

    public async Task UpdateAsync(int id, CotitularCreateDto dto, CancellationToken ct)
    {
        var cotitular = new Cotitular
        {
            Id = id,
            IdCotitularidadTecno = dto.IdCotitularidadTecno,
            IdCotitularidadInst = dto.IdCotitularidadInst,
            IdPersona = dto.IdPersona,
            Porcentaje = dto.Porcentaje
        };

        await _repository.UpdateAsync(cotitular, ct);
    }

    public async Task<bool> PatchAsync(int id, CotitularPatchDto dto, CancellationToken ct)
    {
        return await _repository.PatchAsync(id, dto, ct);
    }

    private static CotitularReadDto MapToDto(Cotitular entity) => new()
    {
        Id = entity.Id,
        IdCotitularidadTecno = entity.IdCotitularidadTecno,
        IdCotitularidadInst = entity.IdCotitularidadInst,
        IdPersona = entity.IdPersona,
        Porcentaje = entity.Porcentaje,
        FechaCreacion = entity.FechaCreacion,
        UltimoCambio = entity.UltimoCambio
    };
}