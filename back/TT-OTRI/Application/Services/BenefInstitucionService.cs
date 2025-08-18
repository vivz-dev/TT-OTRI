// ============================================================================
// Application/Services/BenefInstitucionService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class BenefInstitucionService
{
    private readonly IBenefInstitucionRepository _repo;

    public BenefInstitucionService(IBenefInstitucionRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<BenefInstitucionDto>> ListarAsync(CancellationToken ct = default)
    {
        var items = await _repo.GetAllAsync(ct);
        return items.Select(ToDto).ToList();
    }

    public async Task<BenefInstitucionDto?> ObtenerAsync(int id, CancellationToken ct = default)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e is null ? null : ToDto(e);
    }

    public async Task<int> CrearAsync(CreateBenefInstitucionDto dto, CancellationToken ct = default)
    {
        var entity = new BenefInstitucion { Nombre = dto.Nombre.Trim() };
        return await _repo.CreateAsync(entity, ct);
    }

    public async Task<bool> ActualizarAsync(int id, UpdateBenefInstitucionDto dto, CancellationToken ct = default)
    {
        var entity = new BenefInstitucion { Id = id, Nombre = dto.Nombre.Trim() };
        return await _repo.UpdateAsync(entity, ct);
    }

    public Task<bool> EliminarAsync(int id, CancellationToken ct = default)
        => _repo.DeleteAsync(id, ct);

    private static BenefInstitucionDto ToDto(BenefInstitucion e) => new()
    {
        Id = e.Id,
        Nombre = e.Nombre,
        FechaCreacion = e.FechaCreacion,
        UltimoCambio = e.UltimoCambio
    };
}