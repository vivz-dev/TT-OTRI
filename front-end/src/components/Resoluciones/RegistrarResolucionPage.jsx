/**
 * RegistrarResolucionPage
 * -----------------------
 * • Guardar -> NO valida, NO llama API, solo arma payload y lo imprime en console.log.
 * • Finalizar -> valida todo y guarda en backend (completed = true).
 */
import { useRef, useState } from 'react';
import RegistrarResolucionHeader  from './components/RegistrarResolucionHeader';
import RegistrarResolucionScroll  from './components/RegistrarResolucionScroll';
import RegistrarResolucionFooter  from './components/RegistrarResolucionFooter';
import {
  useCreateResolutionMutation,
  useCreateDistributionMutation,
} from '../../services/resolutionsApi';
import './RegistrarResolucionPage.css';
import { getIdPersonaFromAppJwt } from '../../services/api';

/* ---------------- helpers comunes ---------------- */
const toIsoOrToday = (d) => {
  const dt = d ? new Date(d) : new Date();
  return new Date(Date.UTC(
    dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0
  )).toISOString();
};

const buildResolutionPayload = (resData, isFinal) => {
  const codigo      = resData?.numero?.trim() || '—';
  const descripcion = (resData?.descripcion ?? '').trim() || '—';

  const idUsuario = getIdPersonaFromAppJwt() ?? 0; 

  return {
    IdUsuario: idUsuario,
    Codigo: codigo,
    Titulo: codigo,
    Descripcion: descripcion,
    FechaResolucion: toIsoOrToday(resData?.fechaResolucion),
    FechaVigencia:   toIsoOrToday(resData?.fechaVigencia || resData?.fechaResolucion),
    Completed: !!isFinal,
  };
};

const RegistrarResolucionPage = ({ onBack }) => {
  /* ---------------- estado local ---------------- */
  const [file, setFile]         = useState(null);
  const [formError, setErr]     = useState(false);
  const [shake, setShake]       = useState({ form: false, file: false });

  /* ---------------- refs internos ---------------- */
  const formRef   = useRef();
  const scrollRef = useRef();

  /* ---------------- RTK-Query hooks -------------- */
  const [createResolution]   = useCreateResolutionMutation();
  const [createDistribution] = useCreateDistributionMutation();

  /* ---------------- save / finish --------------- */
  const persist = async (isFinal) => {
    if (isFinal) {
      // 🔒 Validación fuerte
      const { valido, data } = formRef.current.validate();
      const distribsOk = scrollRef.current.validate();
      const archivoOk  = !!file;

      const fullValid = valido && distribsOk && archivoOk;
      if (!fullValid) {
        setErr(true);
        setShake({ form: !valido || !distribsOk, file: !archivoOk });
        setTimeout(() => setShake({ form: false, file: false }), 500);
        return;
      }

      // ✅ Guardar en backend
      const resolutionPayload = buildResolutionPayload(data, true);
      try {
        const resolution = await createResolution(resolutionPayload).unwrap();
        const resolutionId = resolution.id;

        const distribuciones = scrollRef.current.getDistribuciones();
        if (Array.isArray(distribuciones) && distribuciones.length > 0) {
          await Promise.all(
            distribuciones.map((d) =>
              createDistribution({ resolutionId, body: d }).unwrap()
            )
          );
        }

        alert('¡Registro completado!');
        onBack && onBack();
      } catch (err) {
        console.error('[ERROR]', err);
        console.error('[ModelState]', err?.data);
        alert('Error al guardar la información.');
      }
      return;
    }

    // 📝 Guardar (borrador) → solo console.log
    const raw = formRef.current.getRaw();
    const distribuciones = scrollRef.current.getDistribuciones();
    const resolutionPayload = buildResolutionPayload(raw, false);

    const preview = {
      endpoint: {
        createResolution: 'POST /api/resoluciones',
        createDistribution: 'POST /api/resoluciones/{resolutionId}/distribuciones',
      },
      resolutionPayload,
      distribucionesPayload: distribuciones,
      aviso: 'Solo previsualización. No se envió al backend.',
    };

    console.log('[BORRADOR PREVIEW]', preview);
  };

  /* ---------------- handlers UI ------------------ */
  const handleSave   = () => persist(false);
  const handleFinish = () => persist(true);
  const handleFile   = (e) => setFile(e.target.files[0]);

  /* ---------------- render ----------------------- */
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
          file={file}
          onFileChange={handleFile}
          onSave={handleSave}
          onFinish={handleFinish}
          formError={formError}
          shakeError={formError && shake.file}
        />

        {formError && <div className="warning-msg">Debe llenar todos los campos.</div>}
      </div>
    </main>
  );
};

export default RegistrarResolucionPage;
