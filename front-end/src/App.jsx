import React from 'react';
import './styles/App.css';
// import { useMsal } from '@azure/msal-react';
// import Button from 'react-bootstrap/Button';
// import { loginRequest } from './components/Auth/authConfig';
// import { callMsGraph } from './components/Auth/graph';
// import { ProfileData } from './components/ProfileData';

//rutas
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './components/Roles/rolePage';
import Inicio from './components/Inicio/Inicio';   //  ←  path correcto


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/inicio" element={<Inicio />} />
      </Routes>
    </Router>
  );
}

export default App;
