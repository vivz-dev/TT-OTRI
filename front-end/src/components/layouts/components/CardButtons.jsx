import React from "react";
import { Eye, Pencil, CircleDollarSign, BanknoteArrowUp, FileText, FilePlus2} from "lucide-react";
import "./CardButtons.css";
import { useModal } from "./ModalProvider";

const onEditarResolucion = (item) => {
  console.log("Editar resolución:", item);
  // Aquí puedes agregar la lógica para editar la resolución
};

const CardButtons = ({ botones = [], item }) => {
  const modal = useModal();

  const BUTTONS = {
    "ver-resolucion": {
      Icon: Eye,
      title: "Ver resolución",
      size: 16,
      onClick: () => modal.open("resolucion", { item }),
    },
    "editar-resolucion": {
      Icon: Pencil,
      title: "Editar resolución",
      size: 13,
      onClick: () => onEditarResolucion?.(item),
    },
    "ver-tecnologia": {
      Icon: Eye,
      title: "Ver tecnología",
      size: 16,
      onClick: () => modal.open("tecnologia", { item }),
    },
    "ver-pagos":{
      Icon: CircleDollarSign,
      title: "Ver Pagos",
      size: 16,
      onClick: () => modal.open("verPagos", { item }),

    },
    "agregar-pagos":{
      Icon: BanknoteArrowUp,
      title: "Agregar Pagos",
      size: 18,
      onClick: () => modal.open("agregarPagos", { item }),
    },
    "ver-documentos":{
      Icon: FileText,
      title: "Ver documentos",
      size: 16,
      onClick: () => console.log("ver-documentos"),

    },
    "agregar-documentos":{
      Icon: FilePlus2,
      title: "Agregar documentos",
      size: 16,
      onClick: () => console.log("agregar-documentos"),

    }

    
  };

  return (
    <div className="card-buttons">
      {botones.map((key) => {
        const cfg = BUTTONS[key];
        if (!cfg) return null;
        const { Icon, title, size, onClick } = cfg;
        return (
          <div key={key} className="card-button" title={title}>
            <Icon className="card-icon" size={size} onClick={onClick} />
          </div>
        );
      })}
    </div>
  );
};

export default CardButtons;
