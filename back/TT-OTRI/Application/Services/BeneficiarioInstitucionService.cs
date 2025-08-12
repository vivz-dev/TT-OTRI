// ============================================================================
// File: Application/Services/BeneficiarioInstitucionService.cs
// Lógica de negocio para listar, crear, actualizar y eliminar beneficiarios
// institucionales.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class BeneficiarioInstitucionService
{
    private readonly IBeneficiarioInstitucionRepository _repo;
    public BeneficiarioInstitucionService(IBeneficiarioInstitucionRepository repo) => _repo = repo;

    /*---------------- Lectura ----------------*/
    public Task<IEnumerable<BeneficiarioInstitucion>> ListAsync()       => _repo.GetAllAsync();
    public Task<BeneficiarioInstitucion?>             GetAsync (int id) => _repo.GetByIdAsync(id);

    /*---------------- Creación ---------------*/
    public async Task<BeneficiarioInstitucion?> CreateAsync(BeneficiarioInstitucionCreateDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Nombre)) return null;
        var e = new BeneficiarioInstitucion { Nombre = dto.Nombre.Trim() };
        await _repo.AddAsync(e);
        return e;
    }

    /*---------------- Patch ------------------*/
    public async Task<bool> PatchAsync(int id, BeneficiarioInstitucionPatchDto dto)
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