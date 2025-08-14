// ============================================================================
// File: Application/Interfaces/IResolutionService.cs
// Contrato del servicio de resoluciones.
// ============================================================================
using TT_OTRI.Application.DTOs;
using TT_OTRI.Domain;

namespace TT_OTRI.Application.Interfaces;

public interface IResolutionService
{
    Task<IEnumerable<Resolution>> ListAsync();
    Task<Resolution?> GetAsync(int id);
    Task<Resolution> CreateAsync(ResolutionCreateDto dto);
    Task<bool> PatchAsync(int id, ResolutionPatchDto dto);
}