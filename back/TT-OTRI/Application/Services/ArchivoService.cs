using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public sealed class ArchivoService
{
    private readonly IArchivoRepository _repo;

    public ArchivoService(IArchivoRepository repo) => _repo = repo;

    private static ArchivoDto ToDto(Archivo x) => new()
    {
        Id = x.Id,
        Tamano = x.Tamano,
        IdTEntidad = x.IdTEntidad,
        Nombre = x.Nombre,
        Formato = x.Formato,
        Url = x.Url,
        FechaCreacion = x.FechaCreacion,
        UltimoCambio = x.UltimoCambio,
        TipoEntidad = x.TipoEntidad   // 🆕
    };
    public async Task<IReadOnlyList<ArchivoDto>> GetAllAsync(CancellationToken ct = default)
        => (await _repo.GetAllAsync(ct)).Select(ToDto).ToList();

    public async Task<ArchivoDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var e = await _repo.GetByIdAsync(id, ct);
        return e is null ? null : ToDto(e);
    }

    public async Task<ArchivoDto> CreateAsync(CreateArchivoDto dto, CancellationToken ct = default)
    {
        var entity = new Archivo
        {
            Tamano = dto.Tamano,
            IdTEntidad = dto.IdTEntidad,
            Nombre = dto.Nombre,
            Formato = dto.Formato,
            Url = dto.Url,
            TipoEntidad = dto.TipoEntidad  // 🆕
        };

        var id = await _repo.CreateAsync(entity, ct);
        var created = await _repo.GetByIdAsync(id, ct) ?? new Archivo { Id = id };
        return ToDto(created);
    }
    public async Task<bool> PatchAsync(int id, UpdateArchivoDto dto, CancellationToken ct = default)
    {
        var patch = new Archivo
        {
            Tamano = dto.Tamano,
            IdTEntidad = dto.IdTEntidad,
            Nombre = dto.Nombre,
            Formato = dto.Formato,
            Url = dto.Url,
            TipoEntidad = dto.TipoEntidad // 🆕
        };
        return await _repo.UpdatePartialAsync(id, patch, ct);
    }}