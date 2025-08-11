// -------------------------------------------------------------------------
// File: Api/Controllers/ResolucionesController.cs
// Exposición HTTP REST para resolver peticiones sobre resoluciones.
// Endpoints: GET (lista / detalle), POST (crear) y PATCH (parcial).
// -------------------------------------------------------------------------
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Services;
using TT_OTRI.Domain;

using Microsoft.AspNetCore.Authorization;

/// <summary>
/// Controlador HTTP para gestionar resoluciones.
/// Expone endpoints para listar, obtener detalle, crear y actualizar parcialmente.
/// </summary>
[ApiController]
[Route("api/resoluciones")]
public class ResolucionesController : ControllerBase
{
    private readonly ResolutionService _svc;

    /// <summary>
    /// Constructor que inyecta el servicio de resoluciones.
    /// </summary>
    /// <param name="svc">Servicio de lógica de negocio para resoluciones.</param>
    public ResolucionesController(ResolutionService svc) => _svc = svc;

    /*------------  GET /api/resoluciones  -------------------------------*/
    /// <summary>
    /// Obtiene la lista de todas las resoluciones.
    /// </summary>
    /// <returns>200 OK con la colección de <see cref="Resolution"/>.</returns>
    [HttpGet]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<ActionResult<IEnumerable<Resolution>>> GetAll()
        => Ok(await _svc.ListAsync());

    /*------------  GET /api/resoluciones/{id}  --------------------------*/
    /// <summary>
    /// Obtiene el detalle de una resolución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la resolución.</param>
    /// <returns>200 OK con la entidad, o 404 NotFound si no existe.</returns>
    [HttpGet("{id:int}")]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<IActionResult> GetById(int id)
        => await _svc.GetAsync(id) is { } res ? Ok(res) : NotFound();

    /*------------  POST /api/resoluciones  ------------------------------*/
    /* Cambia el endpoint POST para que devuelva el objeto creado */
    /// <summary>
    /// Crea una nueva resolución a partir de un <see cref="ResolutionCreateDto"/>.
    /// </summary>
    /// <param name="dto">Datos de creación de la resolución.</param>
    /// <returns>
    /// 201 Created con la entidad creada y cabecera Location, 
    /// o 400 BadRequest si el cuerpo es nulo.
    /// </returns>
    [HttpPost]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<IActionResult> Create([FromBody] ResolutionCreateDto dto)
    {
        if (dto is null) return BadRequest();
        var entity = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity); // ← entity
    }

    /*------------  PATCH /api/resoluciones/{id}  ------------------------*/
    /// <summary>
    /// Actualiza parcialmente una resolución existente usando <see cref="ResolutionPatchDto"/>.
    /// </summary>
    /// <param name="id">Identificador de la resolución a modificar.</param>
    /// <param name="dto">Campos a actualizar parcialmente.</param>
    /// <returns>
    /// 204 NoContent si se actualiza, 404 NotFound si no existe, 
    /// o 400 BadRequest si el cuerpo es nulo.
    /// </returns>
    [HttpPatch("{id:int}")]
    // [Authorize(AuthenticationSchemes = "AppJwt", Roles = "AdminSistema,AdminContrato")]
    public async Task<IActionResult> Patch(int id, [FromBody] ResolutionPatchDto dto)
        => (dto is null)
            ? BadRequest()
            : await _svc.PatchAsync(id, dto) ? NoContent() : NotFound();
}
