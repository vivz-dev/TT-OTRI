// ============================================================================
// File: Application/Services/CotitularService.cs
// Lógica de negocio: valida FKs y evita duplicados del par (cotitularidad, instit).
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class CotitularService
{
    private readonly ICotitularRepository       _repo;
    private readonly ICotitularidadRepository   _cotRepo;
    private readonly ICotitularInstitRepository _instRepo;
    private readonly IUserRepository            _userRepo;

    public CotitularService(
        ICotitularRepository       repo,
        ICotitularidadRepository   cotRepo,
        ICotitularInstitRepository instRepo,
        IUserRepository            userRepo)
    {
        _repo     = repo;
        _cotRepo  = cotRepo;
        _instRepo = instRepo;
        _userRepo = userRepo;
    }

    /*--------------------- Lectura ---------------------*/
    public Task<IEnumerable<Cotitular>> ListAsync()
        => _repo.GetAllAsync();

    public Task<Cotitular?> GetAsync(int id)
        => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Cotitular>> ListByCotitularidadAsync(int cotitularidadId)
        => _repo.GetByCotitularidadAsync(cotitularidadId);

    /*--------------------- Creación --------------------*/
    /// <summary>
    /// Crea un cotitular validando FKs y que no exista el par (cotitularidad, instit).
    /// Devuelve el Id creado o <c>null</c> si falla validación.
    /// </summary>
    public async Task<int?> CreateAsync(CotitularCreateDto dto)
    {
        if (await _cotRepo .GetByIdAsync(dto.CotitularidadId)   is null) return null;
        if (await _instRepo.GetByIdAsync(dto.CotitularInstitId) is null) return null;
        if (await _userRepo.GetByIdAsync(dto.IdUsuario)         is null) return null;

        if (await _repo.GetByPairAsync(dto.CotitularidadId, dto.CotitularInstitId) is not null)
            return null; // duplicado

        var e = new Cotitular
        {
            CotitularidadId    = dto.CotitularidadId,
            CotitularInstitId  = dto.CotitularInstitId,
            IdUsuario          = dto.IdUsuario,
            PorcCotitularidad  = dto.PorcCotitularidad ?? 0m
        };
        await _repo.AddAsync(e);
        return e.Id;
    }

    /*---------------------- Patch ----------------------*/
    public async Task<bool> PatchAsync(int id, CotitularPatchDto dto)
    {
        var e = await _repo.GetByIdAsync(id);
        if (e is null) return false;

        var newCotId   = dto.CotitularidadId   ?? e.CotitularidadId;
        var newInstId  = dto.CotitularInstitId ?? e.CotitularInstitId;
        var newUserId  = dto.IdUsuario         ?? e.IdUsuario;

        // Validar FKs si cambian
        if (newCotId != e.CotitularidadId && await _cotRepo.GetByIdAsync(newCotId)   is null) return false;
        if (newInstId!= e.CotitularInstitId && await _instRepo.GetByIdAsync(newInstId) is null) return false;
        if (newUserId!= e.IdUsuario         && await _userRepo.GetByIdAsync(newUserId) is null) return false;

        // Validar duplicado de par si cambió alguno
        if (newCotId != e.CotitularidadId || newInstId != e.CotitularInstitId)
        {
            var dup = await _repo.GetByPairAsync(newCotId, newInstId);
            if (dup is not null && dup.Id != e.Id) return false;
        }

        e.CotitularidadId   = newCotId;
        e.CotitularInstitId = newInstId;
        e.IdUsuario         = newUserId;
        if (dto.PorcCotitularidad.HasValue) e.PorcCotitularidad = dto.PorcCotitularidad.Value;

        e.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(e);
        return true;
    }

    /*--------------------- Delete ----------------------*/
    public Task<bool> DeleteAsync(int id) => _repo.DeleteAsync(id);
}
