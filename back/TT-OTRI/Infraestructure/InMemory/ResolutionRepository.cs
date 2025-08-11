// ============================================================================
// File: Infrastructure/InMemory/ResolutionRepository.cs
// Implementación temporal (en memoria) que cumple el contrato del repositorio.
// Este repositorio in-memory se utiliza para pruebas y desarrollo; en
// producción se reemplazará por una versión basada en EF Core y DB2.
// ============================================================================

using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Infrastructure.InMemory;

/// <summary>
/// Implementación en memoria del contrato IResolutionRepository. Utiliza una
/// lista interna para almacenar resoluciones y proveer operaciones CRUD.
/// </summary>
public class ResolutionRepository : IResolutionRepository
{
    // Almacenamiento de resoluciones en memoria. Se inicializa con un
    // registro de ejemplo para facilitar pruebas y desarrollo.
    private readonly List<Resolution> _store = new()
    {
        new()
        {
            Id = 1,
            IdUsuario = 99,
            Codigo = "24-07-228",
            Titulo = "Resolución 1",
            Descripcion = "CONOCER y APROBAR la Distribución de beneficios económicos por explotación del\n“SOFTWARE DE MONITOREO, PREDICCIÓN Y RESPUESTA A RIESGOS (SENTIFY)”,\npropuesta contenida en la recomendación de la Comisión de Investigación, Desarrollo e Innovación\nde la ESPOL (I+D+i) Nro. RES-CIDI-2024-010",
            Estado = ResolutionStatus.Vigente,
            FechaResolucion = new(2025, 9, 16),
            FechaVigencia = new(2030, 9, 15),
            Completed = true
        }
    };

    /// <summary>
    /// Obtiene la lista completa de resoluciones almacenadas en memoria.
    /// </summary>
    /// <param name="_">Token de cancelación (no utilizado).</param>
    /// <returns>Una colección enumerable de todas las resoluciones.</returns>
    public Task<IEnumerable<Resolution>> GetAllAsync(CancellationToken _) 
        => Task.FromResult(_store.AsEnumerable());

    /// <summary>
    /// Obtiene una resolución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la resolución buscada.</param>
    /// <param name="_">Token de cancelación (no utilizado).</param>
    /// <returns>La resolución encontrada, o null si no existe.</returns>
    public Task<Resolution?> GetByIdAsync(int id, CancellationToken _) 
        => Task.FromResult(_store.FirstOrDefault(r => r.Id == id));

    /// <summary>
    /// Agrega una nueva resolución al almacenamiento en memoria. Calcula un Id
    /// incremental y actualiza las marcas de tiempo de creación y actualización.
    /// </summary>
    /// <param name="res">La resolución a agregar.</param>
    /// <param name="_">Token de cancelación (no utilizado).</param>
    public Task AddAsync(Resolution res, CancellationToken _) 
    {
        res.Id = _store.Any() ? _store.Max(r => r.Id) + 1 : 1;
        res.CreatedAt = res.UpdatedAt = DateTime.UtcNow;
        _store.Add(res);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Actualiza una resolución existente en memoria. Si se encuentra una
    /// coincidencia por Id, la reemplaza; de lo contrario, no hace nada.
    /// </summary>
    /// <param name="res">La resolución con los datos actualizados.</param>
    /// <param name="_">Token de cancelación (no utilizado).</param>
    public Task UpdateAsync(Resolution res, CancellationToken _) 
    {
        var idx = _store.FindIndex(r => r.Id == res.Id);
        if (idx >= 0) _store[idx] = res;
        return Task.CompletedTask;
    }
}
