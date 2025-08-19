using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/tecnologias")]
[Authorize] // Protegido con JWT
public sealed class TecnologiaController : ControllerBase
{
    private readonly TecnologiaService _svc;

    public TecnologiaController(TecnologiaService svc)
    {
        _svc = svc;
    }

    /// <summary>Obtiene todas las tecnologías</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TecnologiaReadDto>>> GetAll(CancellationToken ct)
    {
        return Ok(await _svc.GetAllAsync(ct));
    }

    /// <summary>Obtiene una tecnología por ID</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TecnologiaReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Crea una nueva tecnología</summary>
    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] TecnologiaCreateDto body, 
        CancellationToken ct)
    {
        var newId = await _svc.CreateAsync(body, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    /// <summary>Actualiza parcialmente una tecnología</summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(
        int id, 
        [FromBody] TecnologiaPatchDto body, 
        CancellationToken ct)
    {
        await _svc.UpdateAsync(id, body, ct);
        return NoContent();
    }
}