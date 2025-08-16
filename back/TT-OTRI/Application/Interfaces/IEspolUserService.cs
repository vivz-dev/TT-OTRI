using TT_OTRI.Application.DTOs;

namespace TT_OTRI.Application.Interfaces;

public interface IEspolUserService
{
    Task<EspolUserDto?> GetByIdAsync(int idPersona, CancellationToken ct = default);
}