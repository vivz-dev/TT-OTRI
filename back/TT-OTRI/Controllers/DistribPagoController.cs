// Controllers/DistribPagoController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/distribuciones-pago")]
[Authorize]
public sealed class DistribPagoController : ControllerBase
{
    private readonly DistribPagoService _service;

    public DistribPagoController(DistribPagoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DistribPagoReadDto>>> GetAll(CancellationToken ct)
    {
        return Ok(await _service.GetAllAsync(ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DistribPagoReadDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] DistribPagoCreateDto dto, CancellationToken ct)
    {
        var id = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] DistribPagoCreateDto dto, CancellationToken ct)
    {
        return await _service.UpdateAsync(id, dto, ct) 
            ? NoContent() 
            : NotFound();
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Patch(int id, [FromBody] DistribPagoPatchDto dto, CancellationToken ct)
    {
        return await _service.PatchAsync(id, dto, ct) 
            ? NoContent() 
            : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        return await _service.DeleteAsync(id, ct) 
            ? NoContent() 
            : NotFound();
    }
}