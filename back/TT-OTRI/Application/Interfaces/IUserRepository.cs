// ============================================================================
// File: Application/Interfaces/IUserRepository.cs
// Contrato mínimo para resolver FK de Usuario.
// ============================================================================
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
}