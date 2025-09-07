import React, { useState, useEffect } from 'react';
import { PageHeader } from '../layouts/components';
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

const Roles = ({ setActiveSection }) => {
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

  const availableRoles = rolesData || [];

  useEffect(() => {
    if (personasData) {
      setUsers(personasData);
    }
  }, [personasData]);

  const handleSelectUsuario = (usuario) => {
    console.log('Usuario seleccionado:', usuario);
    setSelectedUser(usuario);
  };

  const handleEdit = (idRolPersona, currentIdRol) => {
    setEditingId(idRolPersona);
    setTempRole(currentIdRol.toString());
  };

  const handleSave = async (idRolPersona, idPersona) => {
    try {
      await updateRolPersona({
        idRolPersona,
        body: { idRol: parseInt(tempRole) }
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
    if (!selectedUser || !selectedUser.raw || !selectedUser.raw.idPersona) {
      alert('Por favor, selecciona un usuario válido con correo ESPOL');
      return;
    }

    // Verificar que selectedRole sea un número válido
    if (!selectedRole || isNaN(parseInt(selectedRole))) {
      alert('Por favor, selecciona un rol válido');
      return;
    }

    try {
      // Asegurarse de que idRol sea un número válido
      const idRol = parseInt(selectedRole);
      
      console.log('Enviando datos:', {
        idPersona: selectedUser.raw.idPersona,
        idRol: idRol,
        tipoIdPersona: typeof selectedUser.raw.idPersona,
        tipoIdRol: typeof idRol
      });

      await createRolPersona({
        idPersona: selectedUser.raw.idPersona,
        idRol: idRol
      }).unwrap();
      
      setShowAddForm(false);
      setSelectedUser(null);
      setSelectedRole('');
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
    <main className="page-container roles-page">
      <div className="roles-header">
        <button 
          className="back-button"
          onClick={() => setActiveSection('ajustes')}
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader
          title="Gestión de Roles"
          subtitle="Administra los permisos y roles de los usuarios del sistema"
        />
      </div>

      <div className="roles-content-full">
        <div className="table-actions">
          <button 
            className="btn-add-user" 
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isCreating}
          >
            {isCreating ? <Loader size={18} /> : <Plus size={18} />}
            <span>{isCreating ? 'Agregando...' : 'Agregar usuario'}</span>
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
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-select"
              >
                <option value="">Seleccionar rol</option>
                {availableRoles.map(role => (
                  <option key={role.id} value={role.id}>
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
                <th>Usuario</th>
                <th>Roles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(persona => (
                <React.Fragment key={persona.idPersona}>
                  {persona.roles.map((rol, index) => (
                    <tr key={rol.idRolPersona}>
                      {index === 0 && (
                        <td rowSpan={persona.roles.length}>
                          {persona.apellidos} {persona.nombres}
                        </td>
                      )}
                      <td>
                        {editingId === rol.idRolPersona ? (
                          <select 
                            value={tempRole} 
                            onChange={(e) => setTempRole(e.target.value)}
                            className="role-select"
                            disabled={isUpdating}
                          >
                            {availableRoles.map(role => (
                              <option key={role.id} value={role.id}>
                                {role.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`role-badge role-${rol.nombre.toLowerCase()}`}>
                            {rol.nombre}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingId === rol.idRolPersona ? (
                          <div className="action-buttons">
                            <button 
                              className="btn-icon save"
                              onClick={() => handleSave(rol.idRolPersona, persona.idPersona)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader size={16} /> : <Save size={16} />}
                            </button>
                            <button 
                              className="btn-icon cancel"
                              onClick={handleCancel}
                              disabled={isUpdating}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              className="btn-icon edit"
                              onClick={() => handleEdit(rol.idRolPersona, rol.idRol)}
                              disabled={isDeleting}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="btn-icon delete"
                              onClick={() => handleDelete(rol.idRolPersona)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? <Loader size={16} /> : <Trash2 size={16} />}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
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