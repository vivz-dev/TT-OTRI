import { useRef, useState } from 'react';
import RegistrarResolucionHeader  from './components/RegistrarResolucionHeader';
import RegistrarResolucionScroll  from './components/RegistrarResolucionScroll';
import RegistrarResolucionFooter  from './components/RegistrarResolucionFooter';
import './RegistrarResolucionPage.css';
import { getIdPersonaFromAppJwt } from '../../services/api';
import { useCreateResolucionCompletaMutation } from '../../services/resolucionOrchestratorApi';

/* helpers */
const toIsoOrNull = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0)).toISOString();
};
const normFrac = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return n > 1 ? n / 100 : n;
};
const numOrNull = (v) => (v === null || v === '' || v === undefined ? null : Number(v));

/* payload resolución */
const buildResolutionPayload = (resData, isFinal) => {
  const numero       = (resData?.Numero ?? resData?.numero ?? '—').toString().trim();
  const titulo       = (resData?.Titulo ?? resData?.titulo ?? numero).toString().trim();
  const descripcion  = (resData?.Descripcion ?? resData?.descripcion ?? '—').toString().trim();
  const fechaResol   = resData?.FechaResolucion ?? resData?.fechaResolucion ?? null;
  const fechaVig     = resData?.FechaVigencia   ?? resData?.fechaVigencia   ?? null;
  const idUsuario    = getIdPersonaFromAppJwt() ?? 0;

  return {
    IdUsuario: idUsuario,
    Codigo: numero,
    Titulo: titulo,
    Descripcion: descripcion,
    FechaResolucion: toIsoOrNull(fechaResol),
    FechaVigencia:   toIsoOrNull(fechaVig),
    Completed: !!isFinal,
  };
};

/* normalizador distribuciones */
const normalizeDistribuciones = (rawDistribs) => {
  const arr = Array.isArray(rawDistribs) ? rawDistribs : [];
  return arr.map((d) => {
    const rawAutores =
      d?.PorcSubtotalAutores ?? d?.porcSubtotalAutores ?? 0;
    const rawInstit =
      d?.PorcSubtotalInstituciones ?? d?.porcSubtotalInstituciones ??
      d?.PorcSubtotalInstitut ?? d?.porcSubtotalInstitut ?? 0;

    const MontoMinimo = numOrNull(d?.MontoMinimo);
    const MontoMaximo = numOrNull(d?.MontoMaximo);

    const PorcSubtotalAutores  = normFrac(rawAutores);
    const PorcSubtotalInstitut = normFrac(rawInstit);

    const beneficiariosSrc = Array.isArray(d?.BeneficiariosInstitucionales)
      ? d.BeneficiariosInstitucionales
      : [];

    const beneficiarios = beneficiariosSrc
      .map((b) => ({
        IdBenefInstitucion: Number(b?.IdBenefInstitucion ?? 0),
        Porcentaje: normFrac(b?.Porcentaje ?? (b?.PorcentajePct ?? 0)),
      }))
      .filter((x) => Number.isFinite(x.IdBenefInstitucion) && x.IdBenefInstitucion > 0);

    return {
      MontoMinimo,
      MontoMaximo,
      PorcSubtotalAutores,
      PorcSubtotalInstitut,
      beneficiarios,
    };
  });
};

const RegistrarResolucionPage = ({ onBack, onSuccess }) => {
  const [formError, setErr]         = useState(false);
  const [shake, setShake]           = useState({ form: false });
  const [submitting, setSubmitting] = useState(false);
  const [resolutionId, setResolutionId] = useState(null);

  const [createResolucionCompleta] = useCreateResolucionCompletaMutation();

  const formRef   = useRef();
  const scrollRef = useRef();

  const handleSave = async () => {
    const raw =
      (formRef.current.getPayload && formRef.current.getPayload()) ||
      (formRef.current.getRaw && formRef.current.getRaw()) ||
      {};
    const distribucionesRaw = scrollRef.current.getDistribuciones();

    console.groupCollapsed('[BORRADOR] PREVIEW');
    console.log('form:', raw);
    console.log('distribuciones:', distribucionesRaw);
    console.groupEnd();
  };

    const handleFinish = async () => {
    setSubmitting(true);
    setErr(false);
    setShake({ form: false });

    try {
      const { valido, payloadResolucion } = formRef.current.validate();
      const distribsOk = scrollRef.current.validate();
      if (!(valido && distribsOk)) {
        setErr(true);
        setShake({ form: !(valido && distribsOk) });
        console.warn('[VALIDACIÓN] Finalizar bloqueado:', { formValido: valido, distribucionesValidas: distribsOk });
        return;
      }

      const resolutionPayload = buildResolutionPayload(payloadResolucion, true);
      const distribucionesRaw = scrollRef.current.getDistribuciones();
      const distribuciones = normalizeDistribuciones(distribucionesRaw);

      const payload = { resolucion: resolutionPayload, distribuciones };

      const result = await createResolucionCompleta(payload).unwrap();
      const newResolutionId = result?.resolutionId ?? null;
      if (!newResolutionId) throw new Error('Orquestador no devolvió resolutionId');
      setResolutionId(newResolutionId);

      // ✅ Éxito: notifica y “redirige” a Resoluciones
      alert('¡Resolución registrada con éxito!');
      if (typeof onSuccess === 'function') onSuccess();  // 👈 vuelve a la lista

    } catch (err) {
      console.groupCollapsed('[FINALIZAR – ERROR]');
      console.error(err);
      console.groupEnd();
      alert(`Ocurrió un error al registrar. Revisa la consola.\n${String(err?.message || err)}`);
    } finally {
      setSubmitting(false);
    }
  };

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
          resolutionId={resolutionId}
          onSave={handleSave}
          onFinish={submitting ? () => {} : handleFinish}
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
