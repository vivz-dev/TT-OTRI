// layouts/components/SearchInput.jsx
import React from 'react';
import './SearchInput.css';

const SearchInput = ({ placeholder, value, onChange }) => {
  return (
    <div className="search-input-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={'Buscar por título...'}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchInput;
