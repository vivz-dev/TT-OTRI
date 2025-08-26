import React from 'react';
import './Tag.css';

const Tag = ({
    estado,
}) => {
    return (
        <div className={`tag-status ${estado.toLowerCase().replace(/\s+/g, '-')}`}>
          {estado}
        </div>
    )
};

export default Tag;