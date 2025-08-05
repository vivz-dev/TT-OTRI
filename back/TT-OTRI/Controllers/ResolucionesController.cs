using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Application.Services;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("api/resoluciones")]
public class ResolucionesController : ControllerBase
{
    private readonly ResolutionService _svc;
    public ResolucionesController(ResolutionService svc) => _svc = svc;

    /// <summary>Devuelve todas las resoluciones (in-memory).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _svc.ListAsync());
}