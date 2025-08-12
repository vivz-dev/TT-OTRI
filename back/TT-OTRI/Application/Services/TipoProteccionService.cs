// ============================================================================
// File: Application/Services/TipoProteccionService.cs
// Lógica de negocio para listar, crear, actualizar y eliminar tipos de protección.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class TipoProteccionService
{
    private readonly ITipoProteccionRepository _repo;
    public TipoProteccionService(ITipoProteccionRepository repo) => _repo = repo;

    /*------------ Lectura ------------*/
    public Task<IEnumerable<TipoProteccion>> ListAsync()       => _repo.GetAllAsync();
    public Task<TipoProteccion?>             GetAsync (int id) => _repo.GetByIdAsync(id);

    /*------------ Creación -----------*/
    /// <summary>Crea validando que no exista otro con el mismo nombre (case-insensitive).</summary>
    public async Task<TipoProteccion?> CreateAsync(TipoProteccionCreateDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Nombre)) return null;

        var nombre = dto.Nombre.Trim();
        if (await _repo.GetByNameAsync(nombre) is not null) return null; // evitar duplicados

        var e = new TipoProteccion { Nombre = nombre };
        await _repo.AddAsync(e);
        return e;
    }

    /*------------ Patch --------------*/
    public async Task<bool> PatchAsync(int id, TipoProteccionPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.Nombre))
        {
            var nombre = dto.Nombre.Trim();
            var exists = await _repo.GetByNameAsync(nombre);
            if (exists is not null && exists.Id != id) return false; // nombre ya en uso
            e.Nombre = nombre;
        }

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*------------ Delete -------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
