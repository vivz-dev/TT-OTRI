// Application/Services/RolPermisoService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class RolPermisoService
{
    private readonly IRolPermisoRepository _repository;

    public RolPermisoService(IRolPermisoRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<RolPermiso>> GetAllAsync(CancellationToken ct)
        => _repository.GetAllAsync(ct);

    public Task<RolPermiso?> GetByIdAsync(int id, CancellationToken ct)
        => _repository.GetByIdAsync(id, ct);

    public async Task<int> CreateAsync(RolPermisoCreateDto dto, CancellationToken ct)
    {
        var entity = new RolPermiso
        {
            IdRol = dto.IdRol,
            IdAccion = dto.IdAccion,
            Visualizar = dto.Visualizar,
            Editar = dto.Editar,
            Inhabilitar = dto.Inhabilitar,
            Crear = dto.Crear
        };

        await _repository.AddAsync(entity, ct);
        return entity.Id;
    }

    public Task UpdateAsync(int id, RolPermisoCreateDto dto, CancellationToken ct)
    {
        var entity = new RolPermiso
        {
            Id = id,
            IdRol = dto.IdRol,
            IdAccion = dto.IdAccion,
            Visualizar = dto.Visualizar,
            Editar = dto.Editar,
            Inhabilitar = dto.Inhabilitar,
            Crear = dto.Crear
        };

        return _repository.UpdateAsync(entity, ct);
    }

    public Task<bool> PatchAsync(int id, RolPermisoPatchDto dto, CancellationToken ct)
        => _repository.PatchAsync(id, dto, ct);
}