using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface ICotitularidadTecnoRepository
{
    Task<IEnumerable<CotitularidadTecno>> GetAllAsync(CancellationToken ct = default);
    Task<CotitularidadTecno?> GetByIdAsync(int id, CancellationToken ct = default);
    Task AddAsync(CotitularidadTecno entity, CancellationToken ct = default);
    Task UpdateAsync(CotitularidadTecno entity, CancellationToken ct = default);
}