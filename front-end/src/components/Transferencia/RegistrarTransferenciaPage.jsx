/**
 * RegistrarTransferenciaPage
 * --------------------------
 * • Guardar  -> completed=false
 * • Finalizar -> completed=true
 */
import React, { useState, useRef } from 'react';
import Header from './componentes/Header'
import Footer from './componentes/Footer'
import Scroll from './componentes/Scroll'

const RegistrarTransferenciaPage = ({ onBack }) => {
  const [error, setError] = useState(false);
  const formRef = useRef();

  const handleSave = () => { 
    setError(false); 
    console.log('Guardar borrador TT'); 
  };

  const handleFinish = () => { 
    setError(false); 
    
    if (formRef.current) {
      const allData = formRef.current.getData();
      // Extraer solo los datos de transferencia
      const datosTransferencia = {
        fechaInicio: allData.fechaInicio,
        fechaFin: allData.fechaFin,
        tipo: allData.tipo,
        nombre: allData.nombre,
        monto: allData.monto,
        Pago: allData.Pago,
        datosAdicionales: allData.datosAdicionales
      };
      console.log('Datos de Transferencia:', datosTransferencia);
    }
  };

  return (
    <main className="page-container">
      <Header onBack={onBack} />
      <Scroll ref={formRef} />
      <Footer
        onSave={handleSave}
        onFinish={handleFinish}
        formError={error}
      />
    </main>
  );
};

export default RegistrarTransferenciaPage;