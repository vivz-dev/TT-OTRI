// -------------------------------------------------------------------------
// File: Application/Services/ResolutionService.cs
// Orquesta la lógica de negocio para resoluciones y actúa de fachada
// entre controladores y repositorios.  Contiene validaciones mínimas.
// -------------------------------------------------------------------------
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

/// <summary>
/// Servicio de aplicación para gestionar resoluciones.
/// Encapsula la lógica de negocio y delega persistencia al repositorio
/// (<see cref="IResolutionRepository"/>).
/// </summary>
public class ResolutionService
{
    private readonly IResolutionRepository _repo;

    /// <summary>
    /// Constructor que inyecta el repositorio de resoluciones.
    /// </summary>
    /// <param name="repo">Repositorio que implementa operaciones CRUD.</param>
    public  ResolutionService(IResolutionRepository repo) => _repo = repo;

    /* ------------------------- Lectura --------------------------------- */

    /// <summary>
    /// Lista todas las resoluciones.
    /// </summary>
    /// <returns>Colección de <see cref="Resolution"/>.</returns>
    public Task<IEnumerable<Resolution>> ListAsync()        => _repo.GetAllAsync();

    /// <summary>
    /// Obtiene una resolución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la resolución.</param>
    /// <returns>La entidad encontrada o <c>null</c> si no existe.</returns>
    public Task<Resolution?>             GetAsync (int id)  => _repo.GetByIdAsync(id);

    /* ------------------------- Escritura -------------------------------- */
    /* Cambia el método CreateAsync para que devuelva la ENTIDAD completa */

    /// <summary>
    /// Crea una nueva resolución a partir del DTO de creación.
    /// </summary>
    /// <param name="dto">Datos de creación de la resolución.</param>
    /// <returns>La entidad <see cref="Resolution"/> creada (incluye Id asignado por el repositorio).</returns>
    public async Task<Resolution> CreateAsync(ResolutionCreateDto dto)
    {
        var entity = new Resolution
        {
            IdUsuario       = dto.IdUsuario,
            Codigo          = dto.Codigo,
            Titulo          = dto.Titulo,
            Descripcion     = dto.Descripcion,
            FechaResolucion = dto.FechaResolucion,
            FechaVigencia   = dto.FechaVigencia,
            Completed       = dto.Completed          // <- asignar
        };
        await _repo.AddAsync(entity);
        return entity;
    }

    /// <summary>
    /// Actualiza parcialmente una resolución existente con los campos provistos
    /// en el DTO de parche. Si no existe, retorna <c>false</c>.
    /// </summary>
    /// <param name="id">Identificador de la resolución a modificar.</param>
    /// <param name="dto">Campos opcionales a aplicar.</param>
    /// <returns><c>true</c> si se actualiza; <c>false</c> si no existe.</returns>
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
