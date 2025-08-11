// ============================================================================
// File: Infrastructure/InMemory/UserRepository.cs
// Repositorio InMemory para User (FK).
// ============================================================================
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class UserRepository : IUserRepository
{
    private readonly List<User> _store = new()
    {
        new User { Id = 101, Nombre = "Usuario Demo 1", Email = "u1@espol.edu.ec" },
        new User { Id = 102, Nombre = "Usuario Demo 2", Email = "u2@espol.edu.ec" },
    };

    public Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(u => u.Id == id));
}