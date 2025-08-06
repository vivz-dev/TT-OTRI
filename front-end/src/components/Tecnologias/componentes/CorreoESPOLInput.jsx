// src/components/Tecnologias/componentes/CorreoESPOLInput.jsx
import React, { useState } from 'react';
import './Cotitularidad.css';

const usuariosESPOL = [
  { username: 'vveraf', nombre: 'Viviana Vera Falconí', telefono: '0991234567' },
  { username: 'jrivera', nombre: 'José Enrique Rivera López', telefono: '0999876543' },
  { username: 'aluna', nombre: 'Ana Sofía Luna Vásconez', telefono: '0987654321' },
  { username: 'cmoreno', nombre: 'Carlos Andrés Moreno Salazar', telefono: '0996543210' },
  { username: 'mpalacios', nombre: 'María José Palacios Reinoso', telefono: '0981122334' },
  { username: 'dgarcia', nombre: 'Daniel Alejandro García Paredes', telefono: '0963344556' },
  { username: 'rquimis', nombre: 'Rocío Natalia Quimis Andrade', telefono: '0977788990' },
  { username: 'fcarbo', nombre: 'Francisco Xavier Carbo Torres', telefono: '0956677889' },
  { username: 'lchavez', nombre: 'Luis Miguel Chávez Naranjo', telefono: '0944455667' },
  { username: 'jvallejo', nombre: 'Jessica Dayana Vallejo Mite', telefono: '0960011223' },
  { username: 'mmacias', nombre: 'Martín Esteban Macías Ortiz', telefono: '0973216548' },
  { username: 'pmendoza', nombre: 'Paola Andrea Mendoza Robles', telefono: '0985566771' },
  { username: 'gvera', nombre: 'Gabriela Isabel Vera Quiroz', telefono: '0953344556' },
  { username: 'tcastillo', nombre: 'Tomás Fernando Castillo Mejía', telefono: '0997788991' },
  { username: 'kflores', nombre: 'Katherine Liliana Flores Cedeño', telefono: '0934567890' },
];

const CorreoESPOLInput = ({ onSelectUsuario }) => {
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value.toLowerCase();
    setInputValue(value);
    const coincidencias = usuariosESPOL.filter((u) =>
      u.username.toLowerCase().includes(value)
    );
    setFiltered(coincidencias);
  };

  const handleSelect = (usuario) => {
    setInputValue(usuario.username);
    setFiltered([]);
    onSelectUsuario(usuario);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Usuario ESPOL"
        value={inputValue}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
      {filtered.length > 0 && (
        <div className="autocomplete-dropdown">
          {filtered.map((user, idx) => (
            <div
              key={idx}
              className="autocomplete-option"
              onClick={() => handleSelect(user)}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorreoESPOLInput;
