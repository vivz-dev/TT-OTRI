using Microsoft.AspNetCore.Mvc;
using TT_OTRI.Models;

namespace TT_OTRI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MessageController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetHello()
        {
            return Ok(new { message = "hola" });
        }

        [HttpPost]
        public IActionResult PostMessage([FromBody] Message input)
        {
            if (string.IsNullOrWhiteSpace(input?.MessageText))
            {
                return BadRequest(new { error = "El campo 'messageText' es requerido." });
            }

            return Ok(new { received = input.MessageText });
        }
    }
}