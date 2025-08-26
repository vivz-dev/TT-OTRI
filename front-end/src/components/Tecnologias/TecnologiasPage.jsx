import React, { useState, useMemo } from "react";
import { PageHeader, ActionBar, CardScroll } from "../layouts/components";
import { useGetTechnologiesQuery } from "../../services/technologiesApi";
import { ModalProvider } from "../layouts/components/ModalProvider";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha";

const TecnologiasPage = ({ onRegister }) => {
  const [filter, setFilter] = useState("todas");
  const [searchText, setSearchText] = useState("");

  const { data = [], isLoading, error } = useGetTechnologiesQuery();

  const mapped = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((tecnologia) => ({
      id: tecnologia.id,
      estado: tecnologia.estado,
      completed: tecnologia.completed || false,
      titulo: tecnologia.titulo || "Sin título",
      descripcion: tecnologia.descripcion || "Sin descripción",
      fecha: fmtFecha(tecnologia.fecha),
      usuario: tecnologia.usuario || "Usuario no disponible",
      protecciones: tecnologia.protecciones || [], // si lo tienes
      tipo: "tecnologia", // 👈 importante
    }));
  }, [data]);

  const filterOptions = [
    { label: "Todas", value: "todas" },
    { label: "Disponibles", value: "Disponible" },
    { label: "No Disponibles", value: "No Disponible" },
  ];

  return (
    <main className="page-container">
      <PageHeader
        title={
          <span>
            {" "}
            Tecnologías/<em>Know-how</em>{" "}
          </span>
        }
        subtitle={
          <span>
            Gestiona y consulta todas las tecnologías/<em>know-how</em>.
          </span>
        }
      />

      <ActionBar
        filter={filter}
        setFilter={setFilter}
        options={filterOptions}
        searchText={searchText}
        setSearchText={setSearchText}
        onRegister={onRegister}
      />

      <ModalProvider>
        <CardScroll
          filter={filter}
          searchText={searchText}
          dummyData={mapped}
          cardButtons={["ver-tecnologia"]} // botón específico
        />
      </ModalProvider>
    </main>
  );
};

export default TecnologiasPage;
