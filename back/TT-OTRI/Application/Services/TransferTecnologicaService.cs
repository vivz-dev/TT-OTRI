// ============================================================================
// Application/Services/TransferTecnologicaService.cs
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class TransferTecnologicaService
{
    private readonly ITransferTecnologicaRepository _repo;

    public TransferTecnologicaService(ITransferTecnologicaRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<TransferTecnologicaReadDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(ToReadDto).ToList();
    }

    public async Task<TransferTecnologicaReadDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e is null ? null : ToReadDto(e);
    }

    public async Task<int> CreateAsync(TransferTecnologicaCreateDto dto, CancellationToken ct)
    {
        // Defaults y validaciones mínimas
        var estadoChar = (dto.Estado is null or '\0') ? 'V' : char.ToUpperInvariant(dto.Estado.Value);
        if (estadoChar != 'V' && estadoChar != 'F')
            throw new ArgumentException("Estado inválido. Use 'V' (Vigente) o 'F' (Finalizada).", nameof(dto.Estado));

        var entity = new TransferTecnologica
        {
            IdPersona    = dto.IdPersona,
            IdResolucion = dto.IdResolucion,
            IdTecnologia = dto.IdTecnologia,
            Monto        = dto.Monto,
            Pago         = dto.Pago ?? false,
            Completed    = dto.Completed ?? false,
            Titulo       = dto.Titulo ?? string.Empty,
            Descripcion  = dto.Descripcion ?? string.Empty,
            Estado       = estadoChar == 'V' ? TransferStatus.Vigente : TransferStatus.Finalizada,
            FechaInicio  = dto.FechaInicio,
            FechaFin     = dto.FechaFin
        };

        return await _repo.CreateAsync(entity, ct);
    }

    public async Task<bool> PatchAsync(int id, TransferTecnologicaPatchDto dto, CancellationToken ct)
    {
        var changes = new Dictionary<string, object?>();

        void Set(string col, object? val) { changes[col] = val; }

        if (dto.IdPersona.HasValue)    Set("IDPERSONA", dto.IdPersona.Value);
        if (dto.IdResolucion.HasValue) Set("IDOTRITTRESOLUCION", dto.IdResolucion.Value);
        if (dto.IdTecnologia.HasValue) Set("IDOTRITTTECNOLOGIA", dto.IdTecnologia.Value);
        if (dto.Monto.HasValue)        Set("MONTO", dto.Monto.Value);
        if (dto.Pago.HasValue)         Set("PAGO", dto.Pago.Value ? 1 : 0);
        if (dto.Completed.HasValue)    Set("COMPLETADO", dto.Completed.Value ? 1 : 0);
        if (dto.Titulo is not null)    Set("TITULO", dto.Titulo);
        if (dto.Descripcion is not null) Set("DESCRIPCION", dto.Descripcion);
        if (dto.Estado.HasValue)
        {
            var e = char.ToUpperInvariant(dto.Estado.Value);
            if (e != 'V' && e != 'F') throw new ArgumentException("Estado inválido. Use 'V' o 'F'.", nameof(dto.Estado));
            Set("ESTADO", e);
        }
        if (dto.FechaInicio.HasValue)  Set("FECHAINICIO", dto.FechaInicio.Value.Date);
        if (dto.FechaFin.HasValue)     Set("FECHAFIN", dto.FechaFin.Value.Date);

        if (changes.Count == 0) return true; // nada que actualizar

        return await _repo.PatchAsync(id, changes, ct);
    }

    /* ------------------- mapper ------------------- */
    private static TransferTecnologicaReadDto ToReadDto(TransferTecnologica e) => new()
    {
        Id           = e.Id,
        IdPersona    = e.IdPersona,
        IdResolucion = e.IdResolucion,
        IdTecnologia = e.IdTecnologia,
        Monto        = e.Monto,
        Pago         = e.Pago,
        Completed    = e.Completed,
        Titulo       = e.Titulo,
        Descripcion  = e.Descripcion,
        Estado       = e.Estado.ToString(), // Cambio clave aquí: usar ToString() en lugar de (char)
        FechaInicio  = e.FechaInicio,
        FechaFin     = e.FechaFin,
        CreatedAt    = e.CreatedAt,
        UpdatedAt    = e.UpdatedAt
    };
}