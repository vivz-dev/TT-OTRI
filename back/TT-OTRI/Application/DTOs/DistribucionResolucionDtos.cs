// ============================================================================
// Application/DTOs/DistribucionResolucionDtos.cs
// ============================================================================
using System.Text.Json.Serialization;

namespace TT_OTRI.Application.DTOs;

public sealed class DistribucionResolucionDto
{
    public int Id { get; set; }
    public int IdResolucion { get; set; }

    // ✅ MontoMaximo ahora puede ser null
    public decimal? MontoMaximo { get; set; }

    public decimal MontoMinimo { get; set; }
    public decimal PorcSubtotalAutores { get; set; }
    public decimal PorcSubtotalInstitut { get; set; }

    public int? IdUsuarioCrea { get; set; }
    public int? IdUsuarioMod { get; set; }
    public DateTime? FechaCreacion { get; set; }
    public DateTime? FechaModifica { get; set; }
    public DateTime? UltimoCambio { get; set; }
}

public sealed class CreateDistribucionResolucionDto
{
    // Se toma de la ruta en el Controller; si lo envían en el body también lo validamos
    public int? IdResolucion { get; set; }

    // ✅ MontoMaximo nullable
    public decimal? MontoMaximo { get; set; }

    public decimal MontoMinimo { get; set; }
    public decimal PorcSubtotalAutores { get; set; }
    public decimal PorcSubtotalInstitut { get; set; }

    public int? IdUsuarioCrea { get; set; }
}

/// <summary>PATCH: solo se actualiza lo presente en el payload.</summary>
public sealed class PatchDistribucionResolucionDto
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? MontoMaximo { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? MontoMinimo { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? PorcSubtotalAutores { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? PorcSubtotalInstitut { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? IdUsuarioMod { get; set; }
}
