// ============================================================================
// File: Application/Services/TechnologyService.cs
// Lógica de negocio para listar, crear, actualizar y eliminar tecnologías.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class TechnologyService
{
    private readonly ITechnologyRepository _repo;
    public TechnologyService(ITechnologyRepository repo) => _repo = repo;

    /*------------ Lectura ------------*/
    public Task<IEnumerable<Technology>> ListAsync()        => _repo.GetAllAsync();
    public Task<Technology?>             GetAsync (int id)  => _repo.GetByIdAsync(id);

    /*------------ Creación -----------*/
    public async Task<Technology> CreateAsync(TechnologyCreateDto dto)
    {
        var e = new Technology
        {
            IdUsuario     = dto.IdUsuario,
            Titulo        = dto.Titulo,
            Descripcion   = dto.Descripcion,
            Estado        = dto.Estado,
            Completed     = dto.Completed,
            Cotitularidad = dto.Cotitularidad
        };
        await _repo.AddAsync(e);
        return e;
    }

    /*------------ Patch --------------*/
    public async Task<bool> PatchAsync(int id, TechnologyPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (dto.IdUsuario.HasValue)     e.IdUsuario     = dto.IdUsuario.Value;
        if (!string.IsNullOrWhiteSpace(dto.Titulo))      e.Titulo      = dto.Titulo;
        if (!string.IsNullOrWhiteSpace(dto.Descripcion)) e.Descripcion = dto.Descripcion;
        if (dto.Estado.HasValue)        e.Estado        = dto.Estado.Value;
        if (dto.Completed.HasValue)     e.Completed     = dto.Completed.Value;
        if (dto.Cotitularidad.HasValue) e.Cotitularidad = dto.Cotitularidad.Value;

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*------------ Delete -------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
