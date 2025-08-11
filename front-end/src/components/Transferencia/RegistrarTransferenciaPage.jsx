/**
 * RegistrarTransferenciaPage
 * --------------------------
 * • Guardar  -> completed=false
 * • Finalizar -> completed=true
 */
import React, { useState } from 'react';
import Header from './componentes/Header'
import Footer from './componentes/Footer'
import Scroll from './componentes/Scroll'

const RegistrarTransferenciaPage = ({ onBack }) => {
  const [error, setError] = useState(false);

  const handleSave   = () => { setError(false); console.log('Guardar borrador TT'); };
  const handleFinish = () => { setError(false); console.log('Finalizar TT'); };

  return (
    <main className="page-container">
      <Header onBack={onBack} />
      <Scroll />
      <Footer
        onSave={handleSave}
        onFinish={handleFinish}
        formError={error}
      />
    </main>
  );
};

export default RegistrarTransferenciaPage;
