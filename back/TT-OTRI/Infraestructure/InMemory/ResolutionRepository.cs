using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class ResolutionRepository : IResolutionRepository
{
    private readonly List<Resolution> _store = new()
    {
        new()
        {
            Id                 = 1,
            Numero             = "24-07-228",
            Estado             = ResolutionStatus.Vigente,
            Titulo             = "Resolución 1",
            Descripcion        = "Supongamos que es una descripción muy larga... También puede ser el título del documento de resolución.",
            FechaResolucion    = new DateTime(2025, 9, 16),
            FechaVigencia      = new DateTime(2030, 9, 15),
            UsuarioRegistrador = "Viviana Yolanda Vera Falconí",
            Completed          = true
        },
        new()
        {
            Id                 = 2,
            Numero             = "22-04-386",
            Estado             = ResolutionStatus.Derogada,
            Titulo             = "Resolución derogada",
            Descripcion        = "Distribución cancelada. Este documento ya no se encuentra vigente.",
            FechaResolucion    = new DateTime(2023, 1, 10),
            FechaVigencia      = new DateTime(2023, 1, 10), // misma fecha porque quedó sin vigencia
            UsuarioRegistrador = "Juan Pérez",
            Completed          = false
        },
        new()
        {
            Id                 = 3,
            Numero             = "21-12-118",
            Estado             = ResolutionStatus.Vigente,
            Titulo             = "Convenio Internacional",
            Descripcion        = "Documento de colaboración internacional con participación activa en investigaciones.",
            FechaResolucion    = new DateTime(2024, 7, 1),
            FechaVigencia      = new DateTime(2029, 6, 30),
            UsuarioRegistrador = "María López",
            Completed          = true
        }
    };

    public Task<IEnumerable<Resolution>> GetAllAsync(CancellationToken ct = default)
        => Task.FromResult(_store.AsEnumerable());

    public Task<Resolution?> GetByIdAsync(int id, CancellationToken ct = default)
        => Task.FromResult(_store.FirstOrDefault(r => r.Id == id));

    public Task AddAsync(Resolution res, CancellationToken ct = default)
    {
        // Genera Id incremental
        res.Id = _store.Any() ? _store.Max(r => r.Id) + 1 : 1;
        res.CreatedAt = DateTime.UtcNow;
        res.UpdatedAt = DateTime.UtcNow;

        _store.Add(res);
        return Task.CompletedTask;
    }
    
    public Task UpdateAsync(Resolution res, CancellationToken ct = default)
    {
        var idx = _store.FindIndex(r => r.Id == res.Id);
        if (idx >= 0) _store[idx] = res;
        return Task.CompletedTask;
    }

}