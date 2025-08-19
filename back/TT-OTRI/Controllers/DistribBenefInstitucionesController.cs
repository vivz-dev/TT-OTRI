// Controllers/DistribBenefInstitucionesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/distrib-benef-instituciones")]
[Authorize(AuthenticationSchemes = "AppJwt")]
public sealed class DistribBenefInstitucionesController : ControllerBase
{
    private readonly DistribBenefInstitucionService _svc;

    public DistribBenefInstitucionesController(DistribBenefInstitucionService svc)
        => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DistribBenefInstitucionReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DistribBenefInstitucionReadDto>> GetById(int id, CancellationToken ct)
        => (await _svc.GetByIdAsync(id, ct)) is { } dto ? Ok(dto) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DistribBenefInstitucionCreateDto dto, CancellationToken ct)
    {
        if (dto is null) return BadRequest("Body requerido.");

        if (dto.IdDistribucionResolucion <= 0) return BadRequest("IdDistribucionResolucion es obligatorio.");
        if (dto.IdBenefInstitucion <= 0)       return BadRequest("IdBenefInstitucion es obligatorio.");
        if (dto.IdUsuarioCrea <= 0)            return BadRequest("IdUsuarioCrea es obligatorio.");

        // Normaliza porcentaje (DB SCALE=2; tu UI envía 0..1)
        if (dto.Porcentaje < 0m) dto.Porcentaje = 0m;
        if (dto.Porcentaje > 1m) dto.Porcentaje = 1m;

        var id = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] DistribBenefInstitucionPatchDto dto, CancellationToken ct)
        => await _svc.PatchAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
        => await _svc.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
