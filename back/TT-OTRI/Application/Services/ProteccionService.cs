// Application/Services/ProteccionService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class ProteccionService
{
    private readonly IProteccionRepository _repo;

    public ProteccionService(IProteccionRepository repo) => _repo = repo;

    public async Task<IEnumerable<ProteccionReadDto>> GetAllAsync(CancellationToken ct)
        => (await _repo.GetAllAsync(ct)).Select(MapToDto);

    public async Task<ProteccionReadDto?> GetByIdAsync(int id, CancellationToken ct)
        => (await _repo.GetByIdAsync(id, ct)) is { } e ? MapToDto(e) : null;

    public async Task<int> CreateAsync(ProteccionCreateDto dto, CancellationToken ct)
    {
        var entity = new Proteccion
        {
            IdTecnologia     = dto.IdTecnologia,
            IdTipoProteccion = dto.IdTipoProteccion,
            FechaSolicitud   = dto.FechaSolicitud,
            Concesion        = dto.Concesion,
            Solicitud        = dto.Solicitud,
            FechaConcesion   = dto.FechaConcesion
        };
        return await _repo.AddAsync(entity, ct);
    }

    public async Task UpdateAsync(int id, ProteccionPatchDto dto, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Proteccion {id} no encontrada.");

        if (dto.IdTecnologia.HasValue)     e.IdTecnologia     = dto.IdTecnologia.Value;
        if (dto.IdTipoProteccion.HasValue) e.IdTipoProteccion = dto.IdTipoProteccion.Value;
        if (dto.FechaSolicitud.HasValue)   e.FechaSolicitud   = dto.FechaSolicitud.Value;
        if (dto.Concesion.HasValue)        e.Concesion        = dto.Concesion.Value;
        if (dto.Solicitud.HasValue)        e.Solicitud        = dto.Solicitud.Value;
        if (dto.FechaConcesion.HasValue)   e.FechaConcesion   = dto.FechaConcesion.Value;

        await _repo.UpdateAsync(e, ct);
    }

    private static ProteccionReadDto MapToDto(Proteccion e) => new()
    {
        Id               = e.Id,
        IdTecnologia     = e.IdTecnologia,
        IdTipoProteccion = e.IdTipoProteccion,
        FechaSolicitud   = e.FechaSolicitud,
        Concesion        = e.Concesion,
        Solicitud        = e.Solicitud,
        FechaConcesion   = e.FechaConcesion,
        CreatedAt        = e.CreatedAt,
        UpdatedAt        = e.UpdatedAt
    };
}
