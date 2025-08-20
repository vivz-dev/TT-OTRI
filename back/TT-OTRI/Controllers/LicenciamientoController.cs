// ============================================================================
// Controllers/LicenciamientoController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/licenciamientos")]
[Authorize] // Protegido con el JWT de la app (config por defecto en Program.cs)
public sealed class LicenciamientoController : ControllerBase
{
    private readonly LicenciamientoService _service;

    public LicenciamientoController(LicenciamientoService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene todos los registros de licenciamiento
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LicenciamientoReadDto>>> GetAll(CancellationToken ct)
    {
        var licenciamientos = await _service.GetAllAsync(ct);
        return Ok(licenciamientos);
    }

    /// <summary>
    /// Obtiene un licenciamiento por su ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<LicenciamientoReadDto>> GetById(int id, CancellationToken ct)
    {
        var licenciamiento = await _service.GetByIdAsync(id, ct);
        return licenciamiento is null ? NotFound() : Ok(licenciamiento);
    }

    /// <summary>
    /// Crea un nuevo registro de licenciamiento
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<LicenciamientoReadDto>> Create(
        [FromBody] LicenciamientoCreateDto dto, 
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var createdLicenciamiento = await _service.CreateAsync(dto, ct);
            return CreatedAtAction(
                nameof(GetById), 
                new { id = createdLicenciamiento.Id }, 
                createdLicenciamiento);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Actualiza parcialmente un licenciamiento existente (PATCH)
    /// </summary>
    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(
        int id,
        [FromBody] LicenciamientoPatchDto dto,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var updated = await _service.UpdateAsync(id, dto, ct);
            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Elimina un licenciamiento por su ID
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id, ct);
            return deleted ? NoContent() : NotFound();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}