import React from 'react';
import './FilterButton.css';

const FilterButton = ({ label, value, active, onClick }) => {
  const isActive = value === active;

  return (
    <button
      className={`filter-button ${isActive ? 'active' : ''}`}
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );
};

export default FilterButton;
