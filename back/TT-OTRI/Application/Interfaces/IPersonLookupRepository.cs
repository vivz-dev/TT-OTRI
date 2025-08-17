namespace TT_OTRI.Application.Interfaces;

public interface IPersonLookupRepository
{
    Task<int?> GetPersonIdByEmailAsync(string email, CancellationToken ct = default);
}