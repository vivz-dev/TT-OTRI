// ============================================================================
// Controllers/BenefInstitucionesController.cs
// ============================================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/benef-instituciones")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "AppJwt")] // Protegido con el JWT de la app
public sealed class BenefInstitucionesController : ControllerBase
{
    private readonly BenefInstitucionService _service;

    public BenefInstitucionesController(BenefInstitucionService service)
    {
        _service = service;
    }

    // GET: /api/benef-instituciones
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BenefInstitucionDto>>> GetAll(CancellationToken ct)
    {
        var items = await _service.ListarAsync(ct);
        return Ok(items);
    }

    // GET: /api/benef-instituciones/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BenefInstitucionDto>> GetById([FromRoute] int id, CancellationToken ct)
    {
        var item = await _service.ObtenerAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    // POST: /api/benef-instituciones
    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] CreateBenefInstitucionDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto?.Nombre))
            return BadRequest("El nombre es obligatorio.");

        var newId = await _service.CrearAsync(dto!, ct);
        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId });
    }

    // PUT: /api/benef-instituciones/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update([FromRoute] int id, [FromBody] UpdateBenefInstitucionDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto?.Nombre))
            return BadRequest("El nombre es obligatorio.");

        var ok = await _service.ActualizarAsync(id, dto!, ct);
        return ok ? NoContent() : NotFound();
    }

    // DELETE: /api/benef-instituciones/{id}
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete([FromRoute] int id, CancellationToken ct)
    {
        var ok = await _service.EliminarAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }
}
