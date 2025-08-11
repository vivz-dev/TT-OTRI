import React from 'react';
import * as Buttons from '../../layouts/buttons/buttons_index';

const Footer = ({ onSave, onFinish, formError }) => (
  <footer className="footer">
    <div className="footer-buttons">
      <Buttons.SaveButton onClick={onSave} />
      <Buttons.FinishButton onClick={onFinish} />
    </div>
    {formError && <p className="form-error-msg">Debe completar todos los campos.</p>}
  </footer>
);

export default Footer;
