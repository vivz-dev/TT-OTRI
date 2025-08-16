namespace TT_OTRI.Domain;

public sealed class EspolUser
{
    public int IdPersona { get; set; }                        // IDPERSONA (INTEGER)
    public string NumeroIdentificacion { get; set; } = "";        // NUMEROIDENTIFICA (VARCHAR 14)
    public string Apellidos { get; set; } = "";               // APELLIDOS (VARCHAR 50)
    public string Nombres { get; set; } = "";                 // NOMBRES (VARCHAR 50)
    public string Email { get; set; } = "";                   // EMAIL (VARCHAR 80)
}