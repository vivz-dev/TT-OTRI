// /src/pages/Roles/Badge.jsx
import React from "react";
import { X, Loader } from "lucide-react";

/**
 * Badge de rol con:
 * - "X" al hover (ahora a la izquierda del texto)
 * - Todo el badge es clickeable -> ejecuta onDelete
 * - Modo edición puntual (isEditing) -> <select>
 * - Modo edición masiva (bulkEdit) -> <select> inline que guarda al cambiar
 */
const Badge = ({
  rol,                            // { idRolPersona, idRol, nombre }
  availableRoles,                // [{id, nombre}]
  bulkEdit = false,
  isEditing = false,
  tempValue,
  onTempChange,
  onDelete,
  slugifyRoleName,
  isUpdating = false,
  onBulkChange,
}) => {
  if (isEditing) {
    return (
      <select
        value={tempValue}
        onChange={(e) => onTempChange(e.target.value)}
        className="role-select"
        disabled={isUpdating}
      >
        {availableRoles.map((r) => (
          <option key={String(r.id)} value={String(r.id)}>
            {r.nombre}
          </option>
        ))}
      </select>
    );
  }

  if (bulkEdit) {
    return (
      <select
        defaultValue={String(rol.idRol)}
        className="role-select role-select-inline"
        disabled={isUpdating}
        onChange={(e) => onBulkChange(Number(e.target.value))}
        title="Cambiar rol"
      >
        {availableRoles.map((r) => (
          <option key={String(r.id)} value={String(r.id)}>
            {r.nombre}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      className={`role-badge role-${slugifyRoleName(rol?.nombre)}`}
      onClick={onDelete}
      title="Eliminar rol"
      disabled={isUpdating}
    >
      {isUpdating ? (
        <Loader size={12} className="badge-icon" />
      ) : (
        <X size={12} className="badge-icon" />
      )}
      <span className="badge-text">{rol.nombre}</span>
    </button>
  );
};

export default Badge;
