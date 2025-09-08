import React, { useState, useEffect, useMemo } from 'react';
import RolesHeader  from './RolesHeader';
import { 
  ArrowLeft, 
  Save, 
  Edit3, 
  X, 
  Plus, 
  Trash2,
  Loader 
} from 'lucide-react';
import { 
  useGetPersonasConRolesQuery,
  useGetRolesOtriQuery,
  useCreateRolPersonaMutation,
  useUpdateRolPersonaMutation,
  useDeleteRolPersonaMutation
} from '../../services/rolesApi';
import CorreoESPOLInput from '../Tecnologias/componentes/CorreoESPOLInput';
import './Roles.css';
import Badge from './Badge';

// 🔧 Helper para clases CSS de badges (evita espacios/acentos)
const slugifyRoleName = (name = "") =>
  String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Roles = ({ onBack }) => {
  const { 
    data: personasData, 
    isLoading: isLoadingPersonas, 
    error: errorPersonas, 
    refetch
  } = useGetPersonasConRolesQuery();
  
  const { 
    data: rolesData, 
    isLoading: isLoadingRoles, 
    error: errorRoles 
  } = useGetRolesOtriQuery();
  
  const [createRolPersona, { isLoading: isCreating }] = useCreateRolPersonaMutation();
  const [updateRolPersona, { isLoading: isUpdating }] = useUpdateRolPersonaMutation();
  const [deleteRolPersona, { isLoading: isDeleting }] = useDeleteRolPersonaMutation();

  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tempRole, setTempRole] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [bulkEdit, setBulkEdit] = useState(false); // 👈 edición masiva de badges

  // 🔧 Normaliza roles: siempre { id, nombre }
  const availableRoles = useMemo(() => {
    if (!Array.isArray(rolesData)) return [];
    const mapped = rolesData.map(r => ({
      id: r?.id ?? r?.idRol ?? r?.ID ?? r?.codigo ?? r?.code ?? null,
      nombre: r?.nombre ?? r?.nombreRol ?? r?.descripcion ?? r?.title ?? '—',
      _raw: r,
    }));
    const sinId = mapped.filter(x => x.id == null);
    if (sinId.length) {
      console.warn('[Roles] Algunos roles no tienen "id" ni "idRol":', sinId);
    }
    return mapped.filter(x => x.id != null);
  }, [rolesData]);

  useEffect(() => {
    if (personasData) setUsers(personasData);
  }, [personasData]);

  // Logs útiles
  useEffect(() => {
    console.log('[Roles] rolesData crudo:', rolesData);
    console.table(
      availableRoles.map(r => ({ id: r.id, nombre: r.nombre }))
    );
  }, [rolesData, availableRoles]);

  const handleSelectUsuario = (usuario) => {
    console.log('Usuario seleccionado:', usuario);
    setSelectedUser(usuario);
  };

  const handleEdit = (idRolPersona, currentIdRol) => {
    setEditingId(idRolPersona);
    setTempRole(String(currentIdRol ?? ''));
    console.log('[Roles] Entrando en edición con:', { idRolPersona, currentIdRol });
  };

  const handleSave = async (idRolPersona /*, idPersona*/) => {
    const idRol = Number(tempRole);
    console.log('[Roles] Validación idRol en editar:', { tempRole, idRol, isFinite: Number.isFinite(idRol) });
    if (!Number.isFinite(idRol)) {
      alert('Selecciona un rol válido');
      return;
    }
    try {
      await updateRolPersona({
        idRolPersona,
        body: { idRol }
      }).unwrap();
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      alert('Error al actualizar el rol. Por favor, intenta nuevamente.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempRole('');
  };

  const handleDelete = async (idRolPersona) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      try {
        await deleteRolPersona(idRolPersona).unwrap();
        refetch();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
        alert('Error al eliminar el rol. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleAddUser = async () => {
    if (!selectedUser?.raw?.idPersona) {
      alert('Por favor, selecciona un usuario válido con correo ESPOL');
      return;
    }

    const idRol = Number(selectedRole);
    console.log('[Roles] Validación idRol en agregar:', { selectedRole, idRol, isFinite: Number.isFinite(idRol) });

    if (!Number.isFinite(idRol)) {
      alert('Por favor, selecciona un rol válido');
      return;
    }

    try {
      console.log('Enviando datos (createRolPersona):', {
        idPersona: selectedUser.raw.idPersona,
        idRol,
        tipoIdPersona: typeof selectedUser.raw.idPersona,
        tipoIdRol: typeof idRol
      });

      await createRolPersona({
        idPersona: selectedUser.raw.idPersona,
        idRol
      }).unwrap();
      
      setShowAddForm(false);
      setSelectedUser(null);
      setSelectedRole(''); // ✅ reset correcto
      refetch();
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      if (error.status === 400) {
        alert('Error en los datos enviados. Por favor, verifica que los valores sean correctos.');
      } else {
        alert('Error al agregar usuario. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const onChangeSelectedRole = (e) => {
    const v = e.target.value;
    console.log('[Roles] Rol seleccionado en <select> (raw):', v, ' typeof:', typeof v);
    setSelectedRole(v);
  };

  const isLoading = isLoadingPersonas || isLoadingRoles;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader size={32} className="spinner" />
          <p>Cargando roles...</p>
        </div>
      </div>
    );
  }

  if (errorPersonas || errorRoles) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Error al cargar los datos</h2>
          <p>{errorPersonas?.message || errorRoles?.message || 'Error desconocido'}</p>
          <button onClick={refetch}>Reintentar</button>
          <button onClick={() => window.location.reload()}>Recargar página</button>
        </div>
      </div>
    );
  }

  return (
    <main className="page-container">

      <RolesHeader onBack={onBack} />

      <div className="roles-content-full">
        <div className="table-actions">
          <button 
            className="btn-add-user" 
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isCreating}
          >
            {isCreating ? <Loader size={18} /> : <Plus size={18} />}
            <span>{isCreating ? 'Agregando...' : 'Agregar usuario/rol'}</span>
          </button>

          {/* Botón para activar/desactivar edición masiva de badges */}
          <button
            className={`btn-edit-badges ${bulkEdit ? 'active' : ''}`}
            onClick={() => setBulkEdit(v => !v)}
            title="Editar todos los badges"
          >
            <Edit3 size={18} />
            <span>{bulkEdit ?
            ('Guardar cambios') :
            ('Editar roles')
            }</span>
          </button>
        </div>

        {showAddForm && (
          <div className="add-user-form">
            <h3>Agregar Nuevo Usuario</h3>
            
            <div className="form-field">
              <label>Buscar por correo ESPOL:</label>
              <CorreoESPOLInput 
                onSelectUsuario={handleSelectUsuario}
                className="correo-input"
                menuClassName="correo-menu"
              />
            </div>
            
            {selectedUser && (
              <div className="selected-user-info">
                <h4>Usuario seleccionado:</h4>
                <p><strong>Nombre:</strong> {selectedUser.nombre}</p>
                <p><strong>Correo:</strong> {selectedUser.email}</p>
              </div>
            )}
            
            <div className="form-field">
              <label>Seleccionar rol:</label>
              <select
                value={selectedRole}
                onChange={onChangeSelectedRole}
                className="role-select"
              >
                <option value="">Seleccionar rol</option>
                {availableRoles.map(role => (
                  <option key={String(role.id)} value={String(role.id)}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button onClick={handleAddUser} disabled={isCreating || !selectedUser || !selectedRole}>
                {isCreating ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={handleCancelAdd}>Cancelar</button>
            </div>
          </div>
        )}

        <div className="roles-table-container-full">
<table className="roles-table-full">
  <thead>
    <tr>
      <th style={{textAlign: "center"}}>Usuario</th>
      <th style={{textAlign: "center"}}>Roles</th>
    </tr>
  </thead>
  <tbody>
    {users.map((persona) => (
      <React.Fragment key={persona.idPersona}>
        <tr>
          <td style={{width: "30%", textAlign: "center"}}>
            {persona.apellidos} {persona.nombres}
          </td>
          <td className="roles-cell">
            {persona.roles.map((rol) => (
              <Badge
                key={rol.idRolPersona}
                rol={rol}
                availableRoles={availableRoles}
                bulkEdit={bulkEdit}
                isEditing={editingId === rol.idRolPersona}
                tempValue={tempRole}
                onTempChange={setTempRole}
                onDelete={() => handleDelete(rol.idRolPersona)}
                slugifyRoleName={slugifyRoleName}
                isUpdating={isUpdating || isDeleting}
                onBulkChange={async (newIdRol) => {
                  try {
                    await updateRolPersona({
                      idRolPersona: rol.idRolPersona,
                      body: { idRol: newIdRol }
                    }).unwrap();
                    refetch();
                  } catch (error) {
                    console.error('Error al actualizar en edición masiva:', error);
                    alert('No se pudo actualizar el rol. Intenta nuevamente.');
                  }
                }}
              />
            ))}
          </td>
        </tr>

        {/* —— Separador visual por usuario —— */}
        <tr className="user-separator">
          <td colSpan={2}></td>
        </tr>
      </React.Fragment>
    ))}
  </tbody>
</table>

        </div>

        <div className="roles-disclaimer">
          <p>Cualquier usuario no registrado ingresará con el rol "Autor/Inventor"</p>
        </div>
      </div>
    </main>
  );
};

export default Roles;
