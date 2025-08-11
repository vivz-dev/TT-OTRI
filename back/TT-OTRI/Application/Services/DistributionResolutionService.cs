// -----------------------------------------------------------------------------
// File: Application/Services/DistributionResolutionService.cs
// Orquesta la lógica para crear, leer y actualizar distribuciones.
// -----------------------------------------------------------------------------
using TT_OTRI.Application.DTOs;
using TT_OTRI.Application.Interfaces;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Services;

/// <summary>
/// Servicio de aplicación para gestionar distribuciones económicas
/// asociadas a resoluciones. Encapsula reglas de negocio y delega la
/// persistencia en <see cref="IDistributionResolutionRepository"/>; usa
/// <see cref="IResolutionRepository"/> para validar la FK.
/// </summary>
public class DistributionResolutionService
{
    private readonly IDistributionResolutionRepository _repo;
    private readonly IResolutionRepository             _resolutionRepo; // para validar FK

    /// <summary>
    /// Constructor que inyecta los repositorios de distribuciones y resoluciones.
    /// </summary>
    public DistributionResolutionService(
        IDistributionResolutionRepository repo,
        IResolutionRepository             resolutionRepo)
    {
        _repo = repo;
        _resolutionRepo = resolutionRepo;
    }

    /*---------------------- Lectura -------------------------------------*/

    /// <summary>
    /// Lista todas las distribuciones.
    /// </summary>
    public Task<IEnumerable<DistributionResolution>> ListAsync()
        => _repo.GetAllAsync();

    /// <summary>
    /// Lista las distribuciones pertenecientes a una resolución específica.
    /// </summary>
    /// <param name="resolutionId">Identificador de la resolución.</param>
    public Task<IEnumerable<DistributionResolution>> ListByResolutionAsync(int resolutionId)
        => _repo.GetByResolutionAsync(resolutionId);

    /// <summary>
    /// Obtiene una distribución por su identificador.
    /// </summary>
    /// <param name="id">Identificador de la distribución.</param>
    public Task<DistributionResolution?> GetAsync(int id)
        => _repo.GetByIdAsync(id);

    /*---------------------- Creación ------------------------------------*/

    /// <summary>
    /// Crea una nueva distribución validando previamente que exista la resolución
    /// (FK). Devuelve el identificador creado o <c>null</c> si la resolución no existe.
    /// </summary>
    /// <param name="dto">Datos de creación de la distribución.</param>
    /// <returns>Id de la entidad creada, o <c>null</c> si falla la validación FK.</returns>
    public async Task<int?> CreateAsync(DistributionCreateDto dto)
    {
        // valida que exista la resolución
        if (await _resolutionRepo.GetByIdAsync(dto.ResolutionId) is null)
            return null;

        var entity = new DistributionResolution
        {
            ResolutionId         = dto.ResolutionId,
            MontoMaximo          = dto.MontoMaximo,
            MontoMinimo          = dto.MontoMinimo,
            PorcSubtotalAutores  = dto.PorcSubtotalAutores,
            PorcSubtotalInstitut = dto.PorcSubtotalInstitut
        };
        await _repo.AddAsync(entity);
        return entity.Id;
    }

    /*---------------------- Patch ---------------------------------------*/

    /// <summary>
    /// Actualiza parcialmente una distribución. Si se cambia la resolución
    /// asociada, valida que la nueva FK exista. Devuelve <c>true</c> si se
    /// actualiza correctamente, o <c>false</c> si no existe la entidad o la FK.
    /// </summary>
    /// <param name="id">Identificador de la distribución a modificar.</param>
    /// <param name="dto">Campos opcionales a aplicar.</param>
    public async Task<bool> PatchAsync(int id, DistributionPatchDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity is null) return false;

        // Si quieren mover la distribución a otra resolución se valida FK
        if (dto.ResolutionId.HasValue)
        {
            if (await _resolutionRepo.GetByIdAsync(dto.ResolutionId.Value) is null)
                return false;                           // FK no existe
            entity.ResolutionId = dto.ResolutionId.Value;
        }

        if (dto.MontoMaximo.HasValue)          entity.MontoMaximo          = dto.MontoMaximo.Value;
        if (dto.MontoMinimo.HasValue)          entity.MontoMinimo          = dto.MontoMinimo.Value;
        if (dto.PorcSubtotalAutores.HasValue)  entity.PorcSubtotalAutores  = dto.PorcSubtotalAutores.Value;
        if (dto.PorcSubtotalInstitut.HasValue) entity.PorcSubtotalInstitut = dto.PorcSubtotalInstitut.Value;

        entity.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(entity);
        return true;
    }

}
