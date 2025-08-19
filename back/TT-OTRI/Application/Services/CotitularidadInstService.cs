using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class CotitularidadInstService
{
    private readonly ICotitularidadInstRepository _repo;

    public CotitularidadInstService(ICotitularidadInstRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<CotitularidadInstReadDto>> GetAllAsync(CancellationToken ct)
    {
        var entities = await _repo.GetAllAsync(ct);
        return entities.Select(MapToDto);
    }

    public async Task<CotitularidadInstReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<int> CreateAsync(CotitularidadInstCreateDto dto, CancellationToken ct)
    {
        var entity = new CotitularidadInst
        {
            Nombre = dto.Nombre,
            Correo = dto.Correo,
            Ruc = dto.Ruc
        };
        return await _repo.CreateAsync(entity, ct);
    }

    public async Task UpdateAsync(int id, CotitularidadInstPatchDto dto, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct) 
                     ?? throw new KeyNotFoundException("Registro no encontrado");

        if (dto.Nombre != null) entity.Nombre = dto.Nombre;
        if (dto.Correo != null) entity.Correo = dto.Correo;
        if (dto.Ruc != null) entity.Ruc = dto.Ruc;

        await _repo.UpdateAsync(entity, ct);
    }

    private static CotitularidadInstReadDto MapToDto(CotitularidadInst e) => new()
    {
        Id = e.Id,
        Nombre = e.Nombre,
        Correo = e.Correo,
        Ruc = e.Ruc,
        FechaCreacion = e.FechaCreacion,
        UltimoCambio = e.UltimoCambio
    };
}