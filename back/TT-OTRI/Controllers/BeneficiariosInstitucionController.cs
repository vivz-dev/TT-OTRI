// // ============================================================================
// // File: Api/Controllers/BeneficiariosInstitucionController.cs
// // Rutas:
// // - GET    /api/beneficiarios-institucion
// // - GET    /api/beneficiarios-institucion/{id}
// // - POST   /api/beneficiarios-institucion
// // - PATCH  /api/beneficiarios-institucion/{id}
// // - DELETE /api/beneficiarios-institucion/{id}
// // ============================================================================
// using Microsoft.AspNetCore.Mvc;
// using TT_OTRI.Application.DTOs;
// using TT_OTRI.Application.Services;
// using TT_OTRI.Domain;
//
// namespace TT_OTRI.Api.Controllers;
//
// [ApiController]
// [Route("api/beneficiarios-institucion")]
// public class BeneficiariosInstitucionController : ControllerBase
// {
//     private readonly BeneficiarioInstitucionService _svc;
//     public BeneficiariosInstitucionController(BeneficiarioInstitucionService svc) => _svc = svc;
//
//     /// <summary>GET /api/beneficiarios-institucion</summary>
//     [HttpGet]
//     public async Task<ActionResult<IEnumerable<BeneficiarioInstitucion>>> GetAll()
//         => Ok(await _svc.ListAsync());
//
//     /// <summary>GET /api/beneficiarios-institucion/{id}</summary>
//     [HttpGet("{id:int}")]
//     public async Task<IActionResult> GetById(int id)
//         => await _svc.GetAsync(id) is { } e ? Ok(e) : NotFound();
//
//     /// <summary>POST /api/beneficiarios-institucion</summary>
//     [HttpPost]
//     public async Task<IActionResult> Create([FromBody] BeneficiarioInstitucionCreateDto dto)
//     {
//         var created = await _svc.CreateAsync(dto);
//         return created is null
//             ? BadRequest("Nombre requerido.")
//             : CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
//     }
//
//     /// <summary>PATCH /api/beneficiarios-institucion/{id}</summary>
//     [HttpPatch("{id:int}")]
//     public async Task<IActionResult> Patch(int id, [FromBody] BeneficiarioInstitucionPatchDto dto)
//         => dto is null ? BadRequest() : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
//
//     /// <summary>DELETE /api/beneficiarios-institucion/{id}</summary>
//     [HttpDelete("{id:int}")]
//     public async Task<IActionResult> Delete(int id)
//         => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
// }
