/**
 * RegistrarTransferenciaPage
 * --------------------------
 * • Guardar  -> completed=false
 * • Finalizar -> completed=true
 */
import React, { useState, useRef } from 'react';
import Header from './componentes/Header';
import Footer from './componentes/Footer';
import Scroll from './componentes/Scroll';

// ⬇️ IMPORTA EL HOOK DESDE EL API WRAPPER, NO desde el servicio "puro"
import { useRunTransferTecnologicaFlowMutation } from '../../services/transferTecnologicaOrquestratorApi';

const RegistrarTransferenciaPage = ({ onBack }) => {
  const [error, setError] = useState(false);
  const formRef = useRef();

  // Hook del orquestador frontend
  const [runFlow, { isLoading: isRunning }] = useRunTransferTecnologicaFlowMutation();

  const handleSave = async () => {
    try {
      setError(false);
      if (!formRef.current) return;

      const allData = formRef.current.getData();
      console.log('[TT] Guardar borrador TT - payload:', allData);

      const res = await runFlow({ payload: allData, finalize: false, debug: true }).unwrap();
      console.log('[TT] Borrador guardado OK:', res);
      alert('Borrador guardado');
    } catch (e) {
      console.error('[TT] Error al guardar borrador:', e);
      setError(true);
      alert('Ocurrió un error al guardar el borrador');
    }
  };

  const handleFinish = async () => {
    try {
      setError(false);
      if (!formRef.current) return;

      const allData = formRef.current.getData();

      if (typeof formRef.current.validate === 'function') {
        const v = await formRef.current.validate();
        if (!v?.valido) {
          console.warn('[TT] Validación fallida:', v);
          setError(true);
          alert('Por favor, completa los campos requeridos');
          return;
        }
      }

      // Logs que pediste mantener
      const datosTransferencia = {
        fechaInicio: allData.fechaInicio,
        fechaFin: allData.fechaFin,
        nombre: allData.nombre,
        monto: allData.monto,
        Pago: allData.Pago,
        datosAdicionales: allData.datosAdicionales,
      };
      console.log('Datos de Transferencia:', datosTransferencia);

      // 👇 ÚNICO log del payload completo (solo al finalizar)
      console.log('Payload FINAL para enviar:', allData);

      const res = await runFlow({ payload: allData, finalize: true, debug: true }).unwrap();
      console.log('[TT] FINALIZAR – Resultado orquestador:', res);

      alert('Transferencia registrada con éxito');
      if (typeof onBack === 'function') {
        onBack(); // usa tu navegación existente si está provista
      } else {
        // fallback genérico al inicio
        window.location.assign('/');
        window.location.reload();
      }
    } catch (e) {
      console.error('[TT] Error al finalizar transferencia:', e);
      setError(true);
      alert('Ocurrió un error al finalizar la transferencia');
    }
  };

  return (
    <main className="page-container" aria-busy={isRunning ? 'true' : 'false'}>
      <Header onBack={onBack} />
      <Scroll ref={formRef} />
      <Footer
        onSave={handleSave}
        onFinish={handleFinish}
        formError={error}
      />
    </main>
  );
};

export default RegistrarTransferenciaPage;
