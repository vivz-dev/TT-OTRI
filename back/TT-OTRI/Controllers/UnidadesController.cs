// ============================================================================
// Controllers/UnidadesController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/unidades")]
[Authorize] // ✅ AppJwt por política por defecto (Program.cs)
public sealed class UnidadesController : ControllerBase
{
    private readonly UnidadService _svc;

    public UnidadesController(UnidadService svc)
    {
        _svc = svc;
    }

    /// <summary>
    /// Lista unidades activas (ESTADO='A') sin duplicados, devolviendo IDUNIDAD y NOMBREUNIDAD.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UnidadReadDto>>> GetAll(CancellationToken ct)
    {
        var list = await _svc.GetAllAsync(ct);
        return Ok(list);
    }

    /// <summary>
    /// Obtiene una unidad activa por ID (devuelve IDUNIDAD y NOMBREUNIDAD).
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UnidadReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }
}
