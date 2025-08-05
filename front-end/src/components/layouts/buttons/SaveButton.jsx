// src/components/buttons/SaveButton.jsx
import React from 'react';
import { Save } from 'lucide-react';
import './SaveButton.css';

const SaveButton = ({ onClick }) => {
  return (
    <button className="btn-save" onClick={onClick}>
      <Save size={16} /> Guardar
    </button>
  );
};

export default SaveButton;
