import { useRef, useState } from 'react';
import RegistrarResolucionHeader  from './components/RegistrarResolucionHeader';
import RegistrarResolucionScroll  from './components/RegistrarResolucionScroll';
import RegistrarResolucionFooter  from './components/RegistrarResolucionFooter';
import './RegistrarResolucionPage.css';

import { getIdPersonaFromAppJwt } from '../../services/api';
import { useCreateResolucionCompletaMutation } from '../../services/resolucionOrchestratorApi';
import {
  useCreateResolutionMutation,
  usePatchResolutionMutation,
  useCreateDistributionMutation,
  usePatchDistributionMutation,
} from '../../services/resolutionsApi';


const RegistrarResolucionPage = ({ onBack, onSuccess }) => {
  const [formError, setErr]         = useState(false);
  const [shake, setShake]           = useState({ form: false });
  const [submitting, setSubmitting] = useState(false);
  const [resolutionId, setResolutionId] = useState(null);

  const formRef   = useRef();
  const scrollRef = useRef();
  const footerRef = useRef();   // 👈 nuevo: para disparar subida auto

  return (
    <main className="page-container">
      <RegistrarResolucionHeader onBack={onBack} />

      <div className="registrar-resolucion-page">
        <RegistrarResolucionScroll
          ref={scrollRef}
          shakeFormulario={formError && shake.form}
          formularioRef={formRef}
        />

        <RegistrarResolucionFooter
          ref={footerRef}
          resolutionId={resolutionId}
          onSave={submitting }
          onFinish={submitting}
          formError={formError}
          shakeError={formError && shake.form}
        />

        {submitting && <div className="warning-msg">Guardando… no cierres esta ventana.</div>}
        {formError && (
          <div className="warning-msg">
            Debe llenar correctamente el formulario y las distribuciones.
          </div>
        )}
      </div>
    </main>
  );
};

export default RegistrarResolucionPage;