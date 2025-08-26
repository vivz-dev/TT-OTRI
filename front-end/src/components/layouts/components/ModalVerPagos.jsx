import React from "react";

const ModalVerPagos = ({ item, onClose }) => {
  const stop = (e) => e.stopPropagation();

  return (
    <div className="otri-modal-backdrop backdropStyle" onClick={onClose}>
      <div className="otri-modal modalStyle" onClick={stop}>
        <header className="otri-modal-header headerStyle">
          <h3>Título del Modal</h3>
          {/* Aquí puedes agregar botones o acciones en el header */}
        </header>

        <section
          className="otri-modal-body bodyStyle"
          style={{ maxHeight: "60vh", overflow: "auto" }}
        >
          {/* Aquí va el contenido del modal */}
        </section>

        <footer
          className="otri-modal-footer footerStyle"
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* Botones de acción */}
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ModalVerPagos;
