using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IEspolUserRepository
{
    Task<EspolUser?> GetByIdAsync(int idPersona, CancellationToken ct = default);
}