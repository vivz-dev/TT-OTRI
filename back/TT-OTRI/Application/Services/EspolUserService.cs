using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public sealed class EspolUserService
{
    private readonly IEspolUserRepository _repo;

    public EspolUserService(IEspolUserRepository repo)
    {
        _repo = repo;
    }

    public async Task<EspolUserDto?> GetByIdAsync(int idPersona, CancellationToken ct = default)
    {
        var u = await _repo.GetByIdAsync(idPersona, ct);
        if (u is null) return null;

        return new EspolUserDto
        {
            IdPersona        = u.IdPersona,
            NumeroIdentificacion = u.NumeroIdentificacion,
            Apellidos        = u.Apellidos,
            Nombres          = u.Nombres,
            Email            = u.Email,
        };
    }

    public async Task<IReadOnlyList<EspolUserListItemDto>> SearchByEmailPrefixAsync(string q, int limit, CancellationToken ct = default)
    {
        var list = await _repo.SearchByEmailPrefixAsync(q, limit, ct);
        return list
            .Select(u => new EspolUserListItemDto
            {
                IdPersona = u.IdPersona,
                Email     = u.Email,
                Apellidos = u.Apellidos,
                Nombres   = u.Nombres
            })
            .ToList();
    }

    public async Task<int?> GetIdByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _repo.GetIdPersonaByEmailAsync(email, ct);
    }

    private static string BytesToHex(byte[] bytes)
    {
        if (bytes == null || bytes.Length == 0) return "";
        char[] c = new char[bytes.Length * 2];
        int i = 0;
        foreach (var b in bytes)
        {
            int hi = (b >> 4) & 0xF, lo = b & 0xF;
            c[i++] = (char)(hi < 10 ? '0' + hi : 'A' + (hi - 10));
            c[i++] = (char)(lo < 10 ? '0' + lo : 'A' + (lo - 10));
        }
        return new string(c);
    }
}