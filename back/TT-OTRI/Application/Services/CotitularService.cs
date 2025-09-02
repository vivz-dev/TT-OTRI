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
            IdCotitularidadInst  = dto.IdCotitularidadInst,
            IdPersona            = dto.IdPersona,
            Porcentaje           = dto.Porcentaje,
            PerteneceEspol       = dto.PerteneceEspol,
            Nombre               = string.IsNullOrWhiteSpace(dto.Nombre) ? null : dto.Nombre!.Trim(),
            Correo               = string.IsNullOrWhiteSpace(dto.Correo) ? null : dto.Correo!.Trim(),
            Telefono             = string.IsNullOrWhiteSpace(dto.Telefono) ? null : dto.Telefono!.Trim(),
        };

        return await _repository.AddAsync(cotitular, ct);
    }

    public async Task UpdateAsync(int id, CotitularCreateDto dto, CancellationToken ct)
    {
        var cotitular = new Cotitular
        {
            Id                   = id,
            IdCotitularidadTecno = dto.IdCotitularidadTecno,
            IdCotitularidadInst  = dto.IdCotitularidadInst,
            IdPersona            = dto.IdPersona,
            Porcentaje           = dto.Porcentaje,
            PerteneceEspol       = dto.PerteneceEspol,
            Nombre               = string.IsNullOrWhiteSpace(dto.Nombre) ? null : dto.Nombre!.Trim(),
            Correo               = string.IsNullOrWhiteSpace(dto.Correo) ? null : dto.Correo!.Trim(),
            Telefono             = string.IsNullOrWhiteSpace(dto.Telefono) ? null : dto.Telefono!.Trim(),
        };

        await _repository.UpdateAsync(cotitular, ct);
    }

    public async Task<bool> PatchAsync(int id, CotitularPatchDto dto, CancellationToken ct)
        => await _repository.PatchAsync(id, dto, ct);

    private static CotitularReadDto MapToDto(Cotitular e) => new()
    {
        Id                   = e.Id,
        IdCotitularidadTecno = e.IdCotitularidadTecno,
        IdCotitularidadInst  = e.IdCotitularidadInst,
        IdPersona            = e.IdPersona,
        Porcentaje           = e.Porcentaje,
        PerteneceEspol       = e.PerteneceEspol,
        Nombre               = e.Nombre,
        Correo               = e.Correo,
        Telefono             = e.Telefono,
        FechaCreacion        = e.FechaCreacion,
        UltimoCambio         = e.UltimoCambio
    };
}
