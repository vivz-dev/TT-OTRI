// -------------------------------------------------------------------------
// File: Infrastructure/InMemory/ResolutionRepository.cs
// Implementación temporal (en memoria) que cumple el contrato del
// repositorio.  Sustituir por EF Core + DB2 en producción.
// -------------------------------------------------------------------------
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

public class ResolutionRepository : IResolutionRepository
{
    private readonly List<Resolution> _store = new()
    {
        new()
        {
            Id = 1, IdUsuario = 99,
            Codigo = "24-07-228",
            Titulo = "Resolución 1",
            Descripcion = "CONOCER y APROBAR la Distribución de beneficios económicos por explotación del\n“SOFTWARE DE MONITOREO, PREDICCIÓN Y RESPUESTA A RIESGOS (SENTIFY)”,\npropuesta contenida en la recomendación de la Comisión de Investigación, Desarrollo e Innovación\nde la ESPOL (I+D+i) Nro. RES-CIDI-2024-010",
            Estado = ResolutionStatus.Vigente,
            FechaResolucion = new(2025, 9, 16),
            FechaVigencia   = new(2030, 9, 15),
            Completed = true
        }
    };

    public Task<IEnumerable<Resolution>> GetAllAsync (CancellationToken _) 
        => Task.FromResult(_store.AsEnumerable());

    public Task<Resolution?> GetByIdAsync(int id, CancellationToken _) 
        => Task.FromResult(_store.FirstOrDefault(r => r.Id == id));

    public Task AddAsync(Resolution res, CancellationToken _) 
    {
        res.Id = _store.Any() ? _store.Max(r => r.Id) + 1 : 1;
        res.CreatedAt = res.UpdatedAt = DateTime.UtcNow;
        _store.Add(res);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Resolution res, CancellationToken _) 
    {
        var idx = _store.FindIndex(r => r.Id == res.Id);
        if (idx >= 0) _store[idx] = res;
        return Task.CompletedTask;
    }
}