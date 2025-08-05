import React from 'react';
import './RegisterButton.css';

const RegisterButton = ({ onClick, precheck, text }) => {
  const handleClick = () => {
    if (precheck && !precheck()) return;
    if (onClick) onClick();
  };

  return (
    <button
      className={'register-button'} onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default RegisterButton;
