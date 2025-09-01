/**
 * PagosPage
 * ----------------
 * El título del Card será el código de la resolución
 * y la descripción original pasa a `descripcion`.
 */
import "./PagosPage.css";
import React, { useState, useMemo } from "react";
import { PageHeader, ActionBar, CardScroll } from "../layouts/components";
import { useGetTransfersQuery } from "../../services/transfersApi";
import CompletarRegistro from "../layouts/components/CompletarRegistro";
import { ModalProvider } from "../layouts/components/ModalProvider";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin fecha";

const PagosPage = ({ onRegister }) => {
  const { data = [], isLoading, error } = useGetTransfersQuery();

  // console.log("Admin. contratos TT data:", data, "error:", error);

  const transfersData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // console.log("contratos TT data:", data, "error:", error);

    return data
      .filter(
        (transfer) =>
          transfer.completed === true && transfer.estado === "Vigente"
      ) // ✅ solo completed=true
      .map((transfer) => ({
        id: transfer.id,
        estado: transfer.estado,
        completed: transfer.completed || false,
        titulo: transfer.titulo || "Sin título",
        descripcion: transfer.descripcion || "Sin descripción",
        fecha: fmtFecha(transfer.fechaInicio),
        usuario: transfer.idPersona || "Usuario no disponible",
      }));
  }, [data]);

  const [filter, setFilter] = useState("todas");
  const [searchText, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (isLoading) return <p>Cargando…</p>;
  if (error) return <p>Error al cargar la información. {error.message}</p>;

  const filterOptions = [{ label: "Todas", value: "todas" }];

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <main className="page-container">
      <PageHeader
        title="Administración de contratos de Transferencia Tecnológica (TT)"
        subtitle="Consulta y gestiona de los contratos de transferencia tecnológica vigentes."
      />

      {/* <ActionBar
        filter={filter}
        setFilter={setFilter}
        searchText={searchText}
        setSearchText={setSearch}
      /> */}

      <ModalProvider>
        <CardScroll
          filter={filter}
          searchText={searchText}
          dummyData={transfersData}
          cardButtons={[
            "ver-pagos",
            "agregar-pagos",
            // "ver-documentos",
            // "agregar-documentos",
          ]}
        />
      </ModalProvider>
    </main>
  );
};

export default PagosPage;
