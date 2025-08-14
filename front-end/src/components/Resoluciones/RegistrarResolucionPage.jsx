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

const toIsoOrToday = (d) => {
  const dt = d ? new Date(d) : new Date();
  return new Date(Date.UTC(
    dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0
  )).toISOString(); // ej: "2025-08-12T00:00:00.000Z"
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

  /* ---------------- helpers ---------------------- */
  const resetShake = () => setTimeout(() => setShake({ form: false, file: false }), 500);

  /* ---------------- save / finish --------------- */
  const persist = async (isFinal) => {
  // 1️⃣ Tomar datos del formulario según acción
  let resData;
  if (isFinal) {
    const { valido, data } = formRef.current.validate();
    const distribsOk = scrollRef.current.validate();
    const archivoOk  = !!file;

    const fullValid = valido && distribsOk && archivoOk;
    if (!fullValid) {
      setErr(true);
      setShake({ form: !valido || !distribsOk, file: !archivoOk });
      resetShake();
      return;
    }
    resData = data; // ✅ datos validados
  } else {
    // Guardar borrador: no validar, tomar lo que haya
    resData = formRef.current.getRaw(); // ✅ sin validar
    setErr(false);
    setShake({ form: false, file: false });
  }

  // 🧩 Payload compatible con ResolutionCreateDto (IdUsuario + DateTime ISO):
const codigo      = resData?.numero?.trim() || '—';
const descripcion = (resData?.descripcion ?? '').trim() || '—';

const resolutionPayload = {
  IdUsuario: 1,                 // REQUIRED por el DTO
  Codigo: codigo,               // Case-insensitive, igual mapea
  Titulo: codigo,               // opcional si tu entidad lo usa
  Descripcion: descripcion,
  FechaResolucion: toIsoOrToday(resData?.fechaResolucion),
  FechaVigencia:   toIsoOrToday(resData?.fechaVigencia || resData?.fechaResolucion),
  Completed: !!isFinal,
};


  try {
    // 3️⃣ Crear resolución → obtener ID
    const resolution = await createResolution(resolutionPayload).unwrap();
    const resolutionId = resolution.id;

    // 4️⃣ Distribuciones actuales (si no hay, envía ninguna)
    const distribuciones = scrollRef.current.getDistribuciones();

    // 📝 Para borrador NO exigimos 100% ni campos completos
    if (Array.isArray(distribuciones) && distribuciones.length > 0) {
      await Promise.all(
        distribuciones.map((d) =>
          createDistribution({ resolutionId, body: d }).unwrap()
        )
      );
    }

    // 5️⃣ Feedback
    alert(isFinal ? '¡Registro completado!' : 'Borrador guardado.');
    onBack && onBack();
  } catch (err) {
  console.error('[ERROR]', err);
  // 👇 Suele venir en err.data (modelState) si está [ApiController]
  console.error('[ModelState]', err?.data);
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
