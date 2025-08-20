using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using Microsoft.Extensions.Logging;
using TT_OTRI.Domain;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/regalias")]
[Authorize]
public sealed class RegaliasController : ControllerBase
{
    private readonly RegaliaService _svc;
    private readonly ILogger<RegaliasController> _logger;

    public RegaliasController(RegaliaService svc, ILogger<RegaliasController> logger)
    {
        _svc = svc;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegaliaReadDto>>> GetAll(CancellationToken ct)
    {
        try
        {
            var regalias = await _svc.GetAllAsync(ct);
            return Ok(regalias.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all regalias");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RegaliaReadDto>> GetById(int id, CancellationToken ct)
    {
        try
        {
            var regalia = await _svc.GetByIdAsync(id, ct);
            return regalia is null ? NotFound() : Ok(MapToDto(regalia));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting regalia by id {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] RegaliaCreateDto dto, CancellationToken ct)
    {
        try
        {
            var id = await _svc.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating regalia");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] RegaliaCreateDto dto, CancellationToken ct)
    {
        try
        {
            return await _svc.UpdateAsync(id, dto, ct) 
                ? NoContent() 
                : NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating regalia {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] RegaliaPatchDto dto, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("PATCH request for regalia {Id} with data {@Dto}", id, dto);
            var result = await _svc.PatchAsync(id, dto, ct);
            _logger.LogInformation("PATCH result for regalia {Id}: {Result}", id, result);
            
            return result ? NoContent() : NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error patching regalia {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    private static RegaliaReadDto MapToDto(Regalia r) => new()
    {
        Id = r.Id,
        IdTransferenciaTecnologica = r.IdTransferenciaTecnologica,
        CantidadUnidad = r.CantidadUnidad,
        CantidadPorcentaje = r.CantidadPorcentaje,
        EsPorUnidad = r.EsPorUnidad,
        EsPorcentaje = r.EsPorcentaje,
        FechaCreacion = r.FechaCreacion,
        UltimoCambio = r.UltimoCambio
    };
}