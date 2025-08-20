// Application/Services/DistribPagoService.cs
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class DistribPagoService
{
    private readonly IDistribPagoRepository _repository;

    public DistribPagoService(IDistribPagoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<DistribPagoReadDto>> GetAllAsync(CancellationToken ct)
    {
        var distribuciones = await _repository.GetAllAsync(ct);
        return distribuciones.Select(MapToReadDto);
    }

    public async Task<DistribPagoReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var distribucion = await _repository.GetByIdAsync(id, ct);
        return distribucion == null ? null : MapToReadDto(distribucion);
    }

    public async Task<int> CreateAsync(DistribPagoCreateDto dto, CancellationToken ct)
    {
        var distribucion = new DistribPago
        {
            IdFactura = dto.IdFactura,
            IdTipoTransferencia = dto.IdTipoTransferencia,
            IdAutor = dto.IdAutor,
            MontoTotal = dto.MontoTotal,
            MontoAutor = dto.MontoAutor,
            MontoCentro = dto.MontoCentro
        };

        return await _repository.CreateAsync(distribucion, ct);
    }

    public async Task<bool> UpdateAsync(int id, DistribPagoCreateDto dto, CancellationToken ct)
    {
        var distribucion = new DistribPago
        {
            IdFactura = dto.IdFactura,
            IdTipoTransferencia = dto.IdTipoTransferencia,
            IdAutor = dto.IdAutor,
            MontoTotal = dto.MontoTotal,
            MontoAutor = dto.MontoAutor,
            MontoCentro = dto.MontoCentro
        };

        return await _repository.UpdateAsync(id, distribucion, ct);
    }

    public async Task<bool> PatchAsync(int id, DistribPagoPatchDto dto, CancellationToken ct)
    {
        var existing = await _repository.GetByIdAsync(id, ct);
        if (existing == null) return false;

        if (dto.IdFactura.HasValue) existing.IdFactura = dto.IdFactura.Value;
        if (dto.IdTipoTransferencia.HasValue) existing.IdTipoTransferencia = dto.IdTipoTransferencia.Value;
        if (dto.IdAutor.HasValue) existing.IdAutor = dto.IdAutor.Value;
        if (dto.MontoTotal.HasValue) existing.MontoTotal = dto.MontoTotal.Value;
        if (dto.MontoAutor.HasValue) existing.MontoAutor = dto.MontoAutor.Value;
        if (dto.MontoCentro.HasValue) existing.MontoCentro = dto.MontoCentro.Value;

        return await _repository.UpdateAsync(id, existing, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct)
    {
        return await _repository.DeleteAsync(id, ct);
    }

    private DistribPagoReadDto MapToReadDto(DistribPago distribucion)
    {
        return new DistribPagoReadDto
        {
            Id = distribucion.Id,
            IdFactura = distribucion.IdFactura,
            IdTipoTransferencia = distribucion.IdTipoTransferencia,
            IdAutor = distribucion.IdAutor,
            MontoTotal = distribucion.MontoTotal,
            MontoAutor = distribucion.MontoAutor,
            MontoCentro = distribucion.MontoCentro,
            FechaCreacion = distribucion.FechaCreacion,
            UltimoCambio = distribucion.UltimoCambio
        };
    }
}