// // ============================================================================
// // File: Api/Controllers/DistribucionesBenefInstitController.cs
// // Endpoints REST para gestionar la relación Distribución ↔ Benef. Institucional.
// // ============================================================================
// using Microsoft.AspNetCore.Mvc;
// using TT_OTRI.Application.DTOs;
// using TT_OTRI.Application.Services;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Api.Controllers;
//
// [ApiController]
// public class DistribucionesBenefInstitController : ControllerBase
// {
//     private readonly DistribucionBenefInstitService _svc;
//     public DistribucionesBenefInstitController(DistribucionBenefInstitService svc) => _svc = svc;
//
//     /// <summary>GET /api/distribuciones-benef-instit</summary>
//     [HttpGet("api/distribuciones-benef-instit")]
//     public async Task<ActionResult<IEnumerable<DistribucionBenefInstit>>> GetAll()
//         => Ok(await _svc.ListAsync());
//
//     /// <summary>GET /api/distribuciones/{distId}/benef-instit</summary>
//     [HttpGet("api/distribuciones/{distId:int}/benef-instit")]
//     public async Task<ActionResult<IEnumerable<DistribucionBenefInstit>>> ByDistribucion(int distId)
//         => Ok(await _svc.ListByDistribucionAsync(distId));
//
//     /// <summary>GET /api/distribuciones-benef-instit/{id}</summary>
//     [HttpGet("api/distribuciones-benef-instit/{id:int}")]
//     public async Task<IActionResult> Get(int id)
//         => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();
//
//     /// <summary>POST /api/distribuciones/{distId}/benef-instit</summary>
//     [HttpPost("api/distribuciones/{distId:int}/benef-instit")]
//     public async Task<IActionResult> Create(int distId, [FromBody] DistribucionBenefInstitCreateDto dto)
//     {
//         if (dto is null) return BadRequest();
//         dto.DistribucionResolucionId = distId;
//
//         var created = await _svc.CreateAsync(dto);
//         return created is null
//             ? BadRequest("FK inválida o duplicado (distribución, beneficiario).")
//             : CreatedAtAction(nameof(Get), new { id = created.Id }, created);
//     }
//
//     /// <summary>PATCH /api/distribuciones-benef-instit/{id}</summary>
//     [HttpPatch("api/distribuciones-benef-instit/{id:int}")]
//     public async Task<IActionResult> Patch(int id, [FromBody] DistribucionBenefInstitPatchDto dto)
//         => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
//
//     /// <summary>DELETE /api/distribuciones-benef-instit/{id}</summary>
//     [HttpDelete("api/distribuciones-benef-instit/{id:int}")]
//     public async Task<IActionResult> Delete(int id)
//         => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
// }
