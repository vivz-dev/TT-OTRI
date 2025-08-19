using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class CotitularidadTecnoService
{
    private readonly ICotitularidadTecnoRepository _repo;

    public CotitularidadTecnoService(ICotitularidadTecnoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<CotitularidadTecnoReadDto>> GetAllAsync(CancellationToken ct)
    {
        var entities = await _repo.GetAllAsync(ct);
        var dtos = new List<CotitularidadTecnoReadDto>();
        foreach (var entity in entities)
        {
            dtos.Add(new CotitularidadTecnoReadDto
            {
                Id = entity.Id,
                IdTecnologia = entity.IdTecnologia,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            });
        }
        return dtos;
    }

    public async Task<CotitularidadTecnoReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity == null 
            ? null 
            : new CotitularidadTecnoReadDto
            {
                Id = entity.Id,
                IdTecnologia = entity.IdTecnologia,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
    }

    public async Task<CotitularidadTecnoReadDto> CreateAsync(CotitularidadTecnoCreateDto dto, CancellationToken ct)
    {
        var entity = new CotitularidadTecno { IdTecnologia = dto.IdTecnologia };
        await _repo.AddAsync(entity, ct);
        return new CotitularidadTecnoReadDto
        {
            Id = entity.Id,
            IdTecnologia = entity.IdTecnologia,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public async Task<CotitularidadTecnoReadDto?> UpdateAsync(int id, CotitularidadTecnoPatchDto dto, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity == null) return null;

        if (dto.IdTecnologia.HasValue)
            entity.IdTecnologia = dto.IdTecnologia.Value;

        await _repo.UpdateAsync(entity, ct);
        
        return new CotitularidadTecnoReadDto
        {
            Id = entity.Id,
            IdTecnologia = entity.IdTecnologia,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}