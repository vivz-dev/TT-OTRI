// -------------------------------------------------------------------------
// File: Application/Services/ResolutionService.cs
// Orquesta la lógica de negocio para resoluciones y actúa de fachada
// entre controladores y repositorios.  Contiene validaciones mínimas.
// -------------------------------------------------------------------------
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class ResolutionService
{
    private readonly IResolutionRepository _repo;
    public  ResolutionService(IResolutionRepository repo) => _repo = repo;

    /* ------------------------- Lectura --------------------------------- */
    public Task<IEnumerable<Resolution>> ListAsync()        => _repo.GetAllAsync();
    public Task<Resolution?>             GetAsync (int id)  => _repo.GetByIdAsync(id);

    /* ------------------------- Escritura -------------------------------- */
    public async Task<int> CreateAsync(ResolutionCreateDto dto)
    {
        var entity = new Resolution
        {
            IdUsuario       = dto.IdUsuario,
            Codigo          = dto.Codigo,
            Titulo          = dto.Titulo,
            Descripcion     = dto.Descripcion,
            FechaResolucion = dto.FechaResolucion,
            FechaVigencia   = dto.FechaVigencia
        };
        await _repo.AddAsync(entity);
        return entity.Id;
    }

    public async Task<bool> PatchAsync(int id, ResolutionPatchDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return false;

        if (dto.IdUsuario.HasValue)        entity.IdUsuario   = dto.IdUsuario.Value;
        if (!string.IsNullOrWhiteSpace(dto.Codigo))       entity.Codigo       = dto.Codigo;
        if (!string.IsNullOrWhiteSpace(dto.Titulo))       entity.Titulo       = dto.Titulo;
        if (!string.IsNullOrWhiteSpace(dto.Descripcion))  entity.Descripcion  = dto.Descripcion;
        if (dto.Estado.HasValue)           entity.Estado     = dto.Estado.Value;
        if (dto.FechaResolucion.HasValue)  entity.FechaResolucion = dto.FechaResolucion.Value;
        if (dto.FechaVigencia.HasValue)    entity.FechaVigencia   = dto.FechaVigencia.Value;
        if (dto.Completed.HasValue)        entity.Completed       = dto.Completed.Value;

        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity);
        return true;
    }

}