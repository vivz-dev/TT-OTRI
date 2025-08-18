using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IEspolUserRepository
{
    Task<EspolUser?> GetByIdAsync(int idPersona, CancellationToken ct = default);
    Task<List<EspolUser>> SearchByEmailPrefixAsync(string prefix, int limit, CancellationToken ct = default);
    Task<int?> GetIdPersonaByEmailAsync(string email, CancellationToken ct = default);
}