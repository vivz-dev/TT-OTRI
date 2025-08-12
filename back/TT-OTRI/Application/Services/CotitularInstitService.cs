// ============================================================================
// File: Application/Services/CotitularInstitService.cs
// Lógica de negocio: evita duplicados por RUC/correo y gestiona CRUD.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class CotitularInstitService
{
    private readonly ICotitularInstitRepository _repo;
    public CotitularInstitService(ICotitularInstitRepository repo) => _repo = repo;

    /*------------------- Lectura -------------------*/
    /// <summary>Lista todos los cotitulares institucionales.</summary>
    public Task<IEnumerable<CotitularInstit>> ListAsync() => _repo.GetAllAsync();

    /// <summary>Obtiene un cotitular institucional por Id.</summary>
    public Task<CotitularInstit?> GetAsync(int id) => _repo.GetByIdAsync(id);

    /*------------------- Creación ------------------*/
    /// <summary>
    /// Crea un cotitular institucional validando duplicado por RUC y/o correo.
    /// Retorna la entidad creada o <c>null</c> si falla la validación.
    /// </summary>
    public async Task<CotitularInstit?> CreateAsync(CotitularInstitCreateDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Nombre)) return null;

        var ruc    = dto.Ruc?.Trim();
        var correo = dto.Correo?.Trim();

        if (!string.IsNullOrWhiteSpace(ruc) &&
            await _repo.GetByRucAsync(ruc) is not null) return null;

        if (!string.IsNullOrWhiteSpace(correo) &&
            await _repo.GetByCorreoAsync(correo) is not null) return null;

        var e = new CotitularInstit
        {
            Nombre = dto.Nombre.Trim(),
            Correo = correo ?? string.Empty,
            Ruc    = ruc    ?? string.Empty
        };
        await _repo.AddAsync(e);
        return e;
    }

    /*------------------- Patch ---------------------*/
    /// <summary>
    /// Actualiza parcialmente un cotitular institucional validando duplicados
    /// por RUC/correo si se actualizan. Retorna <c>true</c> si se aplica.
    /// </summary>
    public async Task<bool> PatchAsync(int id, CotitularInstitPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.Ruc))
        {
            var ruc = dto.Ruc.Trim();
            var dup = await _repo.GetByRucAsync(ruc);
            if (dup is not null && dup.Id != e.Id) return false;
            e.Ruc = ruc;
        }

        if (!string.IsNullOrWhiteSpace(dto.Correo))
        {
            var correo = dto.Correo.Trim();
            var dup = await _repo.GetByCorreoAsync(correo);
            if (dup is not null && dup.Id != e.Id) return false;
            e.Correo = correo;
        }

        if (!string.IsNullOrWhiteSpace(dto.Nombre))
            e.Nombre = dto.Nombre.Trim();

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*------------------- Delete --------------------*/
    /// <summary>Elimina un cotitular institucional por Id.</summary>
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
