using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

public class ResolutionService
{
    private readonly IResolutionRepository _repo;
    public ResolutionService(IResolutionRepository repo) => _repo = repo;

    public Task<IEnumerable<Resolution>> ListAsync() => _repo.GetAllAsync();
}