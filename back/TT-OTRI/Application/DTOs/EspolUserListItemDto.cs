namespace TT_OTRI.Application.DTOs;

public sealed class EspolUserListItemDto
{
    public int IdPersona { get; init; }
    public string Email { get; init; } = "";
    public string Apellidos { get; init; } = "";
    public string Nombres { get; init; } = "";
}