import React from "react";
import { Lock, User, CalendarCheck } from "lucide-react";
import "./CardFooter.css";
import CardButtons from "./CardButtons";

const CardFooter = ({
  esTecnologia,
  protecciones = [],
  textoFecha,
  nombrePersona,
  botones,
  item,
}) => {
  return (
    <div className="card-footer">
      <div className="footer-left">
        <div className="footer-item tooltip-wrapper">
          {esTecnologia ? (
            <>
              <Lock size={16} />
              <span className="footer-text">{protecciones.join(", ")}</span>
              <span className="tooltip-text">Tipo de protección.</span>
            </>
          ) : (
            <>
              <CalendarCheck size={16} />
              <span className="footer-text">{textoFecha}</span>
              <span className="tooltip-text">Fecha de vigencia.</span>
            </>
          )}
        </div>
        <div className="footer-item tooltip-wrapper">
          <>
            <User size={16} />
            <span className="footer-text">{nombrePersona}</span>
            <span className="tooltip-text">Usuario que ha registrado este documento.</span>
          </>
        </div>
      </div>

      <div className="footer-right">
        <CardButtons
          botones={botones}
          item={item}
        />
      </div>
    </div>
  );
};

export default CardFooter;
