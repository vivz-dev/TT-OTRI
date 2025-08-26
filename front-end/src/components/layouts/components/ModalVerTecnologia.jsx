import React, { useEffect } from "react";
// si luego quieres, puedes mover estos estilos a tu CSS y quitar los inline

const VistaPreviaTecnologia = ({ item, onClose }) => {
  

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const stop = (e) => e.stopPropagation();

  const protecciones = Array.isArray(item.protecciones) ? item.protecciones : [];

  if (!item) return null;

  return (
    <div className="otri-modal-backdrop backdropStyle" onClick={onClose}>
      <div className="otri-modal modalStyle" onClick={stop}>
        <header className="otri-modal-header headerStyle">
          <h3>Tecnología — {item.titulo || "Sin título"}</h3>
          <button
            className="otri-close-btn"
            onClick={onClose}
            style={{ fontSize: 22, border: "none", background: "transparent", cursor: "pointer" }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <section className="otri-modal-body bodyStyle">
          <div className='mtStyle}'>
            <strong>Descripción</strong>
            <p style={{ whiteSpace: "pre-wrap" }}>{item.descripcion || "Sin descripción"}</p>
          </div>

          <div className='mtStyle}'><strong>Estado:</strong> <span>{item.estado ?? "—"}</span></div>
          <div className='mtStyle}'><strong>Fecha:</strong> <span>{item.fecha ?? "—"}</span></div>
          <div className='mtStyle}'><strong>Registrado por:</strong> <span>{item.usuario ?? "—"}</span></div>
          <div className='mtStyle}'><strong>Completado:</strong> <span>{item.completed ? "Sí" : "No"}</span></div>

          <div className='mtStyle}'>
            <strong>Protecciones</strong>
            {protecciones.length === 0 ? (
              <div><i>Sin protecciones registradas</i></div>
            ) : (
              <ul style={{ marginTop: 6 }}>
                {protecciones.map((p, i) => (
                  <li key={i}>{String(p)}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="otri-modal-footer footerStyle">
          <button onClick={onClose}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default VistaPreviaTecnologia;
