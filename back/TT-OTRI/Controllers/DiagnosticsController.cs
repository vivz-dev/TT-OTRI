using IBM.Data.Db2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Infrastructure.Auth;

namespace TT_OTRI.Controllers;

[ApiController]
[Route("")]
public sealed class DiagnosticsController : ControllerBase
{
    [HttpGet("healthz")]
    [AllowAnonymous]
    public IActionResult Healthz() => Ok(new { ok = true, time = DateTime.UtcNow });

    [HttpGet("api/ping-db2")]
    [Authorize(Policy = AuthSetup.AppPolicy)]
    public IActionResult PingDb2([FromServices] DB2Connection con)
    {
        try
        {
            con.Open();
            using var cmd = con.CreateCommand();
            cmd.CommandText = "SELECT 1 FROM SYSIBM.SYSDUMMY1";
            var one = Convert.ToInt32(cmd.ExecuteScalar());
            return Ok(new { ok = true, one });
        }
        catch (Exception ex)
        {
            return Problem(ex.ToString());
        }
    }
}