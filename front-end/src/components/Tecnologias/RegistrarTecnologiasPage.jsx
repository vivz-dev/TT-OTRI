// src/pages/Resoluciones/RegistrarTecnologiasPage.jsx
import Header from './componentes/Header';
import Footer from './componentes/Footer';
import Scroll from './componentes/Scroll';
import React from 'react';

const RegistrarTecnologiasPage = ({ onBack }) => {
  const [formError, setFormError] = React.useState(false);
  const scrollRef = React.useRef();

  const handleFinish = async () => {
    setFormError(false);
    const res = await scrollRef.current?.finalize();
    console.log(res)
    if (!res?.ok) {
      console.warn(res.message);
    }
  };

  const handleSaveDraft = async () => {
    setFormError(false);
    const res = await scrollRef.current?.saveDraft();
    console.log(res)
    if (!res?.ok) {
      console.warn(res.message);
    }
  };

  return (
    <main className='page-container'>
      <Header onBack={onBack} />
      <Scroll ref={scrollRef} />
      <Footer onFinish={handleFinish} onSaveDraft={handleSaveDraft} formError={formError} />
    </main>
  );
};

export default RegistrarTecnologiasPage;
