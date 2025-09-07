import React, { useEffect, useCallback } from "react";
import { useGetFullTechnologyDetailsQuery } from "../../../services/technologyDetailsApi";

import VerProtecciones from "./tecnologia/VerProtecciones";
import DatosTecnologia from "./tecnologia/DatosTecnologia";
import AcuerdoDistribucion from "./tecnologia/AcuerdoDistribucion";

import * as Buttons from "../buttons/buttons_index";
import Cotitulares from "./tecnologia/Cotitulares";

const VistaPreviaTecnologia = ({ item, onClose }) => {
  const technologyId = item?.id ?? null;

  const { data, error, isLoading } = useGetFullTechnologyDetailsQuery(
    technologyId,
    { skip: !technologyId }
  );

  // Normaliza el objeto para evitar leer "undefined.tecnologia"
  const tec = data?.tecnologia ?? null;

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

  // Callback para abrir archivos de protección (opcional, hijo tiene fallback)
  const handleOpenArchivoProteccion = useCallback((url) => {
    const finalUrl = url || "";
    if (!finalUrl) {
      alert("El archivo no tiene URL disponible.");
      return;
    }
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  }, []);

  if (!item) return null;

  console.log("TECNOLOGIA (item prop) ---> ", item);
  console.log("TECNOLOGIA DETALLES DEL API ---> ", data);

  return (
    <div className="otri-modal-backdrop" onClick={onClose}>
      <div className="otri-modal" onClick={stop}>
        <div className="otri-modal-container">
          <section className="otri-modal-body">
            {/* Datos de la tecnología (extraído) */}
            <DatosTecnologia tec={tec} isLoading={isLoading} error={error} />

            {/* Protecciones (ya extraído) */}
            <VerProtecciones
              protecciones={data?.protecciones}
              isLoading={isLoading}
              onOpenArchivo={handleOpenArchivoProteccion}
            />

            <Cotitulares
              cotitularidad={data?.cotitularidad}
              isLoading={isLoading}
              // opcional: reusa el mismo callback para abrir archivos
              onOpenArchivo={handleOpenArchivoProteccion}
            />

            <AcuerdoDistribucion
              acuerdoDistribucion={data?.acuerdoDistribucion}
              isLoading={isLoading}
              onOpenArchivo={handleOpenArchivoProteccion}
            />
          </section>

          <footer className="otri-modal-footer">
            <Buttons.RegisterButton onClick={onClose} text={"Cerrar"} />
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VistaPreviaTecnologia;
