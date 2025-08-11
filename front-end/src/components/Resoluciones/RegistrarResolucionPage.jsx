/**
 * RegistrarResolucionPage
 * -----------------------
 * • Reúne datos del Formulario y las Distribuciones.
 * • Al Guardar  -> crea Resolution (completed = false) + distribuciones.
 * • Al Finalizar -> valida todo y crea Resolution (completed = true) + distribuciones.
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

  /* ---------------- helpers ---------------------- */
  const resetShake = () => setTimeout(() => setShake({ form: false, file: false }), 500);

  /* ---------------- save / finish --------------- */
  const persist = async (isFinal) => {
    /* 1️⃣  Validar datos */
    const { valido, data: resData } = formRef.current.validate();
    const distribsOk  = scrollRef.current.validate();
    const archivoOk   = !!file;

    const fullValid   = valido && distribsOk && archivoOk;

    if (isFinal && !fullValid) {
      setErr(true);
      setShake({ form: !valido || !distribsOk, file: !archivoOk });
      resetShake();
      return;
    }

    /* 2️⃣  Construir cuerpo de la resolución */
    const resolutionPayload = {
  idUsuario: 1,
  codigo:    resData?.numero || '—',           // fallback
  titulo:    resData?.numero || '—',           // opcional, si backend lo usa
  descripcion: resData?.descripcion || '—',
  fechaResolucion: resData?.fechaResolucion,
  fechaVigencia:   resData?.fechaVigencia,
  completed: isFinal,                          // AHORA sí lo reconoce
};

    try {
      /* 3️⃣  Crear resolución y obtener ID */
      const resolution = await createResolution(resolutionPayload).unwrap();
      const resolutionId = resolution.id;

      /* 4️⃣  Crear cada distribución asociada */
      const distribuciones = scrollRef.current.getDistribuciones();
      await Promise.all(
        distribuciones.map((d) =>
          createDistribution({ resolutionId, body: d }).unwrap()
        )
      );

      /* 5️⃣  Feedback (puedes navegar o mostrar toast) */
      alert(isFinal ? '¡Registro completado!' : 'Guardado como borrador.');
      onBack && onBack();
    } catch (err) {
      console.error('[ERROR]', err);
      alert('Error al guardar la información.');
    }
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
