import Header from './componentes/Header';
import Footer from './componentes/Footer';
import Scroll from './componentes/Scroll';
import React from 'react';

// ⬇️ usa el nombre nuevo del integrador
import { useCreateFullTechnologyFlowMutation } from '../../services/technologyOrchestratorApi';

const RegistrarTecnologiasPage = ({ onBack }) => {
  const [formError, setFormError] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const scrollRef = React.useRef();

  const [runOrchestrator] = useCreateFullTechnologyFlowMutation();

  const handleFinish = async () => {
    setFormError(false);
    try {
      // 1) Valida y arma el payload gigante desde el wizard
      const res = await scrollRef.current?.finalize();
      console.log('[UI] Payload al finalizar =>', res);

      if (!res?.ok) {
        console.warn(res?.message || 'Validación fallida');
        setFormError(true);
        return;
      }

      setIsSubmitting(true);

      // 2) Ejecuta el orquestador end-to-end con ese payload
      const orch = await runOrchestrator({ payload: res.payload }).unwrap();

      console.log('[ORCH] Resultado final =>', orch);

      // 3) Feedback + navegación
      alert('Tecnología registrada con éxito');
      if (typeof onBack === 'function') {
        onBack(); // usa tu navegación existente si está provista
      } else {
        // fallback genérico al inicio
        window.location.assign('/');
        window.location.reload();
      }

    } catch (err) {
      console.error('[ORCH] Error:', err);
      setFormError(true);
      // showToastError(err?.data || 'No se pudo completar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setFormError(false);
    const res = await scrollRef.current?.saveDraft();
    console.log('[UI] Payload al guardar borrador =>', res);
    if (!res?.ok) {
      console.warn(res?.message || 'Error al guardar borrador');
      setFormError(true);
    }
  };

  return (
    <main className='page-container'>
      <Header onBack={onBack} />
      <Scroll ref={scrollRef} />

      {/* puedes pasar isSubmitting a Footer si quieres deshabilitar botones */}
      <Footer
        onFinish={handleFinish}
        onSaveDraft={handleSaveDraft}
        formError={formError}
        isSubmitting={isSubmitting}
      />
    </main>
  );
};

export default RegistrarTecnologiasPage;
