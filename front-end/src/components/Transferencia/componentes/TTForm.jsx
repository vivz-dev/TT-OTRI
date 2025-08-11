/**
 * TTForm
 * ------
 * • Captura datos de una Transferencia Tecnológica.
 * • Dropdowns: Resolución (servicio) y Tecnología (dummy).
 * • Sección adicional: Datos de la ESPOL y del administrador de contrato.
 * • Expone validate() vía ref para que el padre obtenga los datos.
 */
import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import './TTForm.css';
import { useGetResolutionsQuery } from '../../../services/resolutionsApi';

/* ---- Dummy tecnologías (mismo formato que usas en TecnologiasPage) ---- */
const dummyTechs = [
  { id: 1, estado: 'Disponible',   titulo: 'SENTIFY',     descripcion: 'Software de monitoreo', completed: true },
  { id: 2, estado: 'No Disponible',titulo: 'INVENTORY AI',descripcion: 'Licenciada a tercero',  completed: false },
  { id: 3, estado: 'Disponible',   titulo: 'SMART-AGRO',  descripcion: 'IoT + analítica',       completed: true },
];

const TTForm = forwardRef(({ shakeError }, ref) => {
  /* ---------------- Campos del bloque básico ---------------- */
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [tipo, setTipo]               = useState('');
  const [nombre, setNombre]           = useState('');
  const [monto, setMonto]             = useState('');

  /* ---------------- Selecciones ---------------- */
  const [idResolucion, setIdResolucion] = useState('');
  const [idTecnologia, setIdTecnologia] = useState('');

  /* ---------------- Servicio de resoluciones ---------------- */
  const { data: resolutions = [], isLoading, error } = useGetResolutionsQuery();

  const resolucionesOpts = useMemo(
    () =>
      (error ? [] : resolutions).map((r) => ({
        id: r.id,
        label: `${r.codigo} — ${r.descripcion?.slice(0, 60) || ''}`,
        estado: r.estado,
      })),
    [resolutions, error]
  );

  const techOpts = dummyTechs.map((t) => ({
    id: t.id,
    label: `${t.titulo} — ${t.descripcion?.slice(0, 60) || ''}`,
    estado: t.estado,
  }));

  /* ---------------- Datos ESPOL & Admin contrato ---------------- */
  const [espolNombre, setEspolNombre] = useState('');
  const [espolRuc, setEspolRuc]       = useState('');
  const [espolCorreo, setEspolCorreo] = useState('');

  // Admin contrato: puedes pasar estos como props si luego quieres atarlos al usuario autenticado
  const [adminCorreoLocal, setAdminCorreoLocal] = useState('');
  const adminCorreoDominio = '@espol.edu.ec';
  const adminNombre        = 'Viviana Yolanda Vera Falconí';
  const adminCedula        = '0930455694';
  const adminContacto      = '0958798761';

  /* ---------------- Errores ---------------- */
  const [errores, setErrores] = useState({
    fechaInicio: false,
    fechaFin: false,
    tipo: false,
    nombre: false,
    monto: false,
    idResolucion: false,
    idTecnologia: false,
    espolNombre: false,
    espolRuc: false,
    espolCorreo: false,
    adminCorreoLocal: false,
  });

  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const isRucLike = (v) => /^[0-9]{10,13}$/.test(v.replace(/\D/g, ''));

  /* ---------------- Exponer validate() ---------------- */
  useImperativeHandle(ref, () => ({
    validate() {
      const correoAdminCompleto = adminCorreoLocal ? `${adminCorreoLocal}${adminCorreoDominio}` : '';

      const nuevo = {
        fechaInicio: !fechaInicio,
        fechaFin: !fechaFin,
        tipo: tipo.trim() === '',
        nombre: nombre.trim() === '',
        monto: monto === '' || isNaN(Number(monto)),
        idResolucion: !idResolucion,
        idTecnologia: !idTecnologia,
        espolNombre: espolNombre.trim() === '',
        espolRuc: !isRucLike(espolRuc),
        espolCorreo: !isEmail(espolCorreo),
        adminCorreoLocal: adminCorreoLocal.trim() === '',
      };
      setErrores(nuevo);

      const ok = !Object.values(nuevo).some(Boolean);
      return {
        valido: ok,
        data: ok
          ? {
              // Básicos
              fechaInicio,
              fechaFin,
              tipo,
              nombre,
              monto: parseFloat(monto),
              // Relaciones
              idResolucion: Number(idResolucion),
              idTecnologia: Number(idTecnologia),
              // ESPOL
              espol: {
                nombre: espolNombre,
                ruc: espolRuc,
                correo: espolCorreo,
              },
              // Admin contrato
              adminContrato: {
                correo: correoAdminCompleto,
                nombre: adminNombre,
                cedula: adminCedula,
                contacto: adminContacto,
              },
            }
          : null,
      };
    },
  }));

  /* ---------------- Helpers UI ---------------- */
  const selectedRes = resolucionesOpts.find((o) => String(o.id) === String(idResolucion));
  const selectedTec = techOpts.find((o) => String(o.id) === String(idTecnologia));

  return (
    <>
      {/* ======= BLOQUE: Información básica ======= */}
      <div className="formulario">
        <div className="form-header">
          <h1 className="titulo-principal-form">Datos de la transferencia tecnológica</h1>
          <p className="subtitulo-form">Complete la información sobre la TT.</p>
        </div>

        <div className="form-fieldsets">
          <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
            <h2 className="form-card-header">Información básica</h2>

            <div className="input-row">
              <label className="input-group">
                Fecha de inicio de Transferencia Tecnológica
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className={errores.fechaInicio ? 'error' : ''}
                />
              </label>

              <label className="input-group">
                Fecha de fin de Transferencia Tecnológica
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className={errores.fechaFin ? 'error' : ''}
                />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group">
                Tipo
                <input
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className={errores.tipo ? 'error' : ''}
                  placeholder="Tipo de TT (p. ej. Licencia, Spin-off, Know-how)…"
                />
              </label>

              <label className="input-group">
                Nombre
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={errores.nombre ? 'error' : ''}
                  placeholder="Nombre o referencia comercial…"
                />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group">
                Monto
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={errores.monto ? 'error' : ''}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ======= BLOQUE: Asociación resolución / tecnología ======= */}
      <div className="formulario">
        <div className="form-header">
          <h1 className="titulo-principal-form">Asociación de resolución y tecnología</h1>
          <p className="subtitulo-form">
            Selecciona la resolución y la tecnología/know-how relacionadas a esta transferencia.
          </p>
        </div>

        <div className="form-fieldsets">
          <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
            <h2 className="form-card-header">Seleccionar Resolución</h2>
            <div className="input-row">
              <label className="input-group">
                Resolución
                <select
                  value={idResolucion}
                  onChange={(e) => setIdResolucion(e.target.value)}
                  className={errores.idResolucion ? 'error' : ''}
                  disabled={isLoading || error}
                >
                  <option value="">
                    {isLoading ? 'Cargando resoluciones…' : error ? 'Error al cargar' : 'Seleccione…'}
                  </option>
                  {resolucionesOpts.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedRes && (
              <div className="mini-preview">
                <span className={`badge ${selectedRes.estado?.toLowerCase()}`}>{selectedRes.estado}</span>
                <span className="mini-title">{selectedRes.label}</span>
              </div>
            )}
          </div>

          <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
            <h2 className="form-card-header">Seleccionar Tecnología</h2>
            <div className="input-row">
              <label className="input-group">
                Tecnología
                <select
                  value={idTecnologia}
                  onChange={(e) => setIdTecnologia(e.target.value)}
                  className={errores.idTecnologia ? 'error' : ''}
                >
                  <option value="">Seleccione…</option>
                  {techOpts.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedTec && (
              <div className="mini-preview">
                <span className={`badge ${selectedTec.estado?.toLowerCase().replace(' ', '-')}`}>
                  {selectedTec.estado}
                </span>
                <span className="mini-title">{selectedTec.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======= BLOQUE: Datos de la ESPOL y del administrador ======= */}
      <div className="formulario">
        <div className="form-header">
          <h1 className="titulo-principal-form">Datos de la ESPOL</h1>
          <p className="subtitulo-form">Información institucional y del administrador del contrato.</p>
        </div>

        <div className="form-fieldsets">
          {/* --- ESPOL --- */}
          <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
            <h2 className="form-card-header">Datos de la ESPOL</h2>

            <div className="input-row">
              <label className="input-group">
                Nombre
                <input
                  type="text"
                  value={espolNombre}
                  onChange={(e) => setEspolNombre(e.target.value)}
                  className={errores.espolNombre ? 'error' : ''}
                  placeholder="Escuela Superior Politécnica del Litoral"
                />
              </label>

              <label className="input-group">
                RUC
                <input
                  type="text"
                  value={espolRuc}
                  onChange={(e) => setEspolRuc(e.target.value)}
                  className={errores.espolRuc ? 'error' : ''}
                  placeholder="###########"
                />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group" style={{ flex: 1 }}>
                Correo
                <input
                  type="email"
                  value={espolCorreo}
                  onChange={(e) => setEspolCorreo(e.target.value)}
                  className={errores.espolCorreo ? 'error' : ''}
                  placeholder="contacto@espol.edu.ec"
                />
              </label>
            </div>
          </div>

          {/* --- ADMIN CONTRATO --- */}
          <div className={`form-card ${shakeError ? 'error shake' : ''}`}>
            <h2 className="form-card-header">Datos del administrador de contrato</h2>

            <div className="input-row">
              <label className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                Correo
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={adminCorreoLocal}
                    onChange={(e) => setAdminCorreoLocal(e.target.value)}
                    className={errores.adminCorreoLocal ? 'error' : ''}
                    placeholder="usuario"
                    style={{ width: 220 }}
                  />
                  <span className="suffix">{adminCorreoDominio}</span>
                </div>
              </label>

              <label className="input-group">
                Nombre
                <input type="text" value={adminNombre} readOnly className="italic" />
              </label>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Cédula</label>
                <div className="value-big">{adminCedula}</div>
              </div>

              <div className="input-group">
                <label>Número de contacto</label>
                <div className="value-big">{adminContacto}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default TTForm;
