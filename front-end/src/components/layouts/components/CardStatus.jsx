import React from "react";
import "./CardStatus.css";
import * as Components from "../../layouts/components/index";

const CardStatus = ({ estado, iconoExtra, completed }) => {
  return (
    <div className="card-status-container">
      <Components.Tag estado={estado} />
      <div className="tooltip-wrapper">
        {iconoExtra}
        <span className="tooltip-text">
          {completed
            ? "El registro de este documento está completo."
            : "Faltan datos para terminar de registrar este documento."}
        </span>
      </div>
    </div>
  );
};

export default CardStatus;
