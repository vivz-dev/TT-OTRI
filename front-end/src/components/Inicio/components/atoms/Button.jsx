import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'medium',
  icon,
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
};

export default Button;