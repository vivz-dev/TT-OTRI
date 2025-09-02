// Application/DTOs/ProteccionDtos.cs
namespace TT_OTRI.Application.DTOs;

public sealed class ProteccionReadDto
{
    public int Id { get; set; }
    public int IdTecnologia { get; set; }
    public short IdTipoProteccion { get; set; }
    public DateTime? FechaSolicitud { get; set; }
    public short Concesion { get; set; }          // 0/1
    public short Solicitud { get; set; }          // 0/1
    public DateTime? FechaConcesion { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class ProteccionCreateDto
{
    public int IdTecnologia { get; set; }
    public short IdTipoProteccion { get; set; }
    public DateTime? FechaSolicitud { get; set; }
    public short Concesion { get; set; } = 0;      // opcional, default 0
    public short Solicitud { get; set; } = 0;      // opcional, default 0
    public DateTime? FechaConcesion { get; set; }  // opcional
}

public sealed class ProteccionPatchDto
{
    public int? IdTecnologia { get; set; }
    public short? IdTipoProteccion { get; set; }
    public DateTime? FechaSolicitud { get; set; }
    public short? Concesion { get; set; }          // 0/1
    public short? Solicitud { get; set; }          // 0/1
    public DateTime? FechaConcesion { get; set; }
}