// src/pages/Resoluciones/RegistrarResolucionPage.jsx
import { useRef, useState } from 'react';
import RegistrarResolucionHeader from './components/RegistrarResolucionHeader';
import RegistrarResolucionScroll from './components/RegistrarResolucionScroll';
import RegistrarResolucionFooter from './components/RegistrarResolucionFooter';
import './RegistrarResolucionPage.css';
import Formulario from './components/Formulario';

const RegistrarResolucionPage = ({ onBack }) => {

  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState(false);
  const formRef = useRef();
  const scrollRef = useRef();

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleSave = () => console.log('[Guardar] lógica aquí');
  const handleFinish = () => {
  const { valido, data } = formRef.current.validate();
  const distribsOK      = scrollRef.current.validate();
    if (!valido || !distribsOK) {
      setFormError(true);
      return;
    }
    setFormError(false);
    console.log('[Finalizar] Datos validados:', data);
  };

  return (
    <main className='page-container'>
      <RegistrarResolucionHeader onBack={onBack} />
      <RegistrarResolucionScroll ref={scrollRef} formulario={<Formulario ref={formRef} />} />
      <RegistrarResolucionFooter
        file={file}
        onFileChange={handleFileChange}
        onSave={handleSave}
        onFinish={handleFinish}
        formError={formError}
      />
    </main>
  );
};

export default RegistrarResolucionPage;
