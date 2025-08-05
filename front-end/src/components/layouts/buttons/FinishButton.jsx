// src/components/buttons/FinishButton.jsx
import React from 'react';
import { Check } from 'lucide-react';
import './FinishButton.css';

const FinishButton = ({ onClick }) => {
  return (
    <button className="btn-finish" onClick={onClick}>
      <Check size={16} /> Finalizar
    </button>
  );
};

export default FinishButton;
