// Application/Services/CotitularidadInstService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class CotitularidadInstService
{
    private readonly ICotitularidadInstRepository _repository;

    public CotitularidadInstService(ICotitularidadInstRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CotitularidadInstReadDto>> GetAllAsync(CancellationToken ct)
    {
        var entities = await _repository.GetAllAsync(ct);
        return entities.Select(MapToReadDto);
    }

    public async Task<CotitularidadInstReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var entity = await _repository.GetByIdAsync(id, ct);
        return entity == null ? null : MapToReadDto(entity);
    }

    public async Task<int> CreateAsync(CotitularidadInstCreateDto dto, CancellationToken ct)
    {
        var entity = new CotitularidadInst
        {
            Nombre = dto.Nombre,
            Correo = dto.Correo,
            Ruc = dto.Ruc
        };

        return await _repository.AddAsync(entity, ct);
    }

    public async Task<bool> UpdateAsync(int id, CotitularidadInstPatchDto dto, CancellationToken ct)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing == null) return false;

        if (dto.Nombre != null) existing.Nombre = dto.Nombre;
        if (dto.Correo != null) existing.Correo = dto.Correo;
        if (dto.Ruc != null) existing.Ruc = dto.Ruc;

        return await _repository.UpdateAsync(existing, ct);
    }

    private static CotitularidadInstReadDto MapToReadDto(CotitularidadInst entity)
    {
        return new CotitularidadInstReadDto
        {
            Id = entity.Id,
            Nombre = entity.Nombre,
            Correo = entity.Correo,
            Ruc = entity.Ruc,
            FechaCreacion = entity.FechaCreacion,
            UltimoCambio = entity.UltimoCambio
        };
    }
}