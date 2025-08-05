import React from 'react';
import './ActionBar.css'
import * as Buttons from '../buttons/buttons_index';
import SearchInput from './SearchInput'; // asegúrate que la ruta sea correcta

const ActionBar = ({ filter, setFilter, options, searchText, setSearchText, onRegister }) =>{

return (
  <section className="action-bar">
    {/* Campo de búsqueda */}
    <SearchInput
        placeholder="Buscar resoluciones..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

    {/* Filtros */}
    <div className='button-section'>
        {options.map(({ label, value }) => (
          <Buttons.FilterButton
            key={value}
            label={label}
            value={value}
            active={filter}
            onClick={setFilter}
          />
        ))}
    </div>

    {/* Botón Registrar */}
    <Buttons.RegisterButton onClick={onRegister} text={"+ Registrar"}/>
  </section>
);

}

export default ActionBar;