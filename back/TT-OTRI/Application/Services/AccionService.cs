// ============================================================================
// File: Application/Services/AccionService.cs
// Lógica de negocio para listar, obtener, crear, actualizar y eliminar acciones.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class AccionService
{
    private readonly IAccionRepository _repo;
    public AccionService(IAccionRepository repo) => _repo = repo;

    /*---------------- Lectura ----------------*/
    public Task<IEnumerable<Accion>> ListAsync()       => _repo.GetAllAsync();
    public Task<Accion?>             GetAsync (int id) => _repo.GetByIdAsync(id);

    /*---------------- Creación ---------------*/
    public async Task<Accion?> CreateAsync(AccionCreateDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Nombre)) return null;
        var e = new Accion { Nombre = dto.Nombre.Trim() };
        await _repo.AddAsync(e);
        return e;
    }

    /*---------------- Patch ------------------*/
    public async Task<bool> PatchAsync(int id, AccionPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.Nombre))
            e.Nombre = dto.Nombre.Trim();

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*---------------- Delete -----------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}