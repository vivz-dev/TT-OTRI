// src/pages/Resoluciones/componentes/Footer.jsx
import React from 'react';
import './Footer.css';
import * as Buttons from '../../layouts/buttons/buttons_index';

const Footer = ({ onFinish, onSaveDraft, formError }) => (
  <footer className="footer">
    <div className="footer-buttons">
      {/* <Buttons.SaveButton onClick={onSaveDraft} /> */}
      <Buttons.FinishButton onClick={onFinish} />
      {formError && <p className="form-error-msg">Debe completar todos los campos.</p>}
    </div>
  </footer>
);

export default Footer;
