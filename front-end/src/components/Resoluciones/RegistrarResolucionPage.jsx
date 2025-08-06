import { useRef, useState } from 'react';
import RegistrarResolucionHeader from './components/RegistrarResolucionHeader';
import RegistrarResolucionScroll from './components/RegistrarResolucionScroll';
import RegistrarResolucionFooter from './components/RegistrarResolucionFooter';
import './RegistrarResolucionPage.css';

const RegistrarResolucionPage = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState(false);
  const [shakeCards, setShakeCards] = useState({
    formulario: false,
    archivo: false
  });

  const formRef = useRef();
  const scrollRef = useRef();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSave = () => console.log('[Guardar] lógica aquí');

  const handleFinish = () => {
    const { valido, data } = formRef.current.validate();
    const distribsOK = scrollRef.current.validate();
    const archivoOK = !!file;

    const formularioOK = valido && distribsOK;
    const hasError = !formularioOK || !archivoOK;

    if (hasError) {
      setFormError(true);
      setShakeCards({
        formulario: !formularioOK,
        archivo: !archivoOK
      });

      setTimeout(() => {
        setShakeCards({ formulario: false, archivo: false });
      }, 500);
      return;
    }

    setFormError(false);
    console.log('[Finalizar] Datos validados:', data, { file });
  };

  return (
    <main className="page-container">
      <RegistrarResolucionHeader onBack={onBack} />

      <RegistrarResolucionScroll
        ref={scrollRef}
        shakeFormulario={formError && shakeCards.formulario}  // ← Nuevo prop separado
        formularioRef={formRef}
      />

      <div className={`form-card ${formError && shakeCards.archivo ? 'error shake' : formError ? 'error' : ''}`}>
        <RegistrarResolucionFooter
          file={file}
          onFileChange={handleFileChange}
          onSave={handleSave}
          onFinish={handleFinish}
          formError={formError}
        />
      </div>

      {formError && (
        <div className="warning-msg">Debe llenar todos los campos.</div>
      )}
    </main>
  );
};

export default RegistrarResolucionPage;
