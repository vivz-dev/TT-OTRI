using TT_OTRI.Application.Interfaces;

namespace TT_OTRI.Application.Services;

public class PersonLookupService : IPersonLookupService
{
    private readonly IPersonLookupRepository _repo;
    public PersonLookupService(IPersonLookupRepository repo) => _repo = repo;

    public Task<int?> GetPersonIdByEmailAsync(string email, CancellationToken ct = default)
        => _repo.GetPersonIdByEmailAsync(email, ct);
}