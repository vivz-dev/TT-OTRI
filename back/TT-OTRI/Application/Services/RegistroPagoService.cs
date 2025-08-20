// ============================================================================
// Application/Services/RegistroPagoService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class RegistroPagoService
{
    private readonly IRegistroPagoRepository _repo;

    public RegistroPagoService(IRegistroPagoRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<RegistroPagoReadDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(ToReadDto).ToList();
    }

    public async Task<RegistroPagoReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e is null ? null : ToReadDto(e);
    }

    public async Task<int> CreateAsync(RegistroPagoCreateDto dto, CancellationToken ct)
    {
        if (dto.TotalPago < 0) throw new ArgumentException("TotalPago no puede ser negativo.");
        var entity = new RegistroPago
        {
            IdTransferTecnologica = dto.IdTransferTecnologica,
            IdPersona             = dto.IdPersona,
            TotalPago             = dto.TotalPago,
            Completado            = dto.Completado
        };
        return await _repo.CreateAsync(entity, ct);
    }

    public async Task<bool> PatchAsync(int id, RegistroPagoPatchDto dto, CancellationToken ct)
    {
        if (dto.TotalPago is decimal tp && tp < 0)
            throw new ArgumentException("TotalPago no puede ser negativo.");

        var partial = new RegistroPago
        {
            IdTransferTecnologica = dto.IdTransferTecnologica ?? default,
            IdPersona             = dto.IdPersona             ?? default,
            TotalPago             = dto.TotalPago             ?? default,
            Completado            = dto.Completado            ?? default
        };
        return await _repo.PatchAsync(id, partial, ct);
    }

    private static RegistroPagoReadDto ToReadDto(RegistroPago e) => new()
    {
        IdRegistroPago        = e.IdRegistroPago,
        IdTransferTecnologica = e.IdTransferTecnologica,
        IdPersona             = e.IdPersona,
        TotalPago             = e.TotalPago,
        Completado            = e.Completado,
        CreatedAt             = e.CreatedAt,
        UpdatedAt             = e.UpdatedAt
    };
}
