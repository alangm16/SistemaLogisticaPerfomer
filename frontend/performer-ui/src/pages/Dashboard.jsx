// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    api.get('/health')
      .then(() => setStatus('ok'))
      .catch((err) => {
        console.error("Error al llamar backend:", err);
        setStatus('error');
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div>
      <h2>Bienvenido {nombre}</h2>
      <p>Tu rol: {rol}</p>
      <p>Backend status: {status}</p>

      {/* Opciones según rol */}
      {rol === 'ADMIN' && (
        <div>
          <h3>Opciones de administrador</h3>
          <button onClick={() => navigate('/admin/usuarios')}>Gestionar usuarios</button>
        </div>
      )}

      {rol === 'VENDEDOR' && (
        <div>
          <h3>Opciones de vendedor</h3>
          <button onClick={() => navigate('/clientes')}>Gestionar clientes</button>
          <button onClick={() => navigate('/solicitudes')}>Mis solicitudes</button>
        </div>
      )}

      {rol === 'PRICING' && (
        <div>
          <h3>Opciones de ejecutivo de pricing</h3>
          <button onClick={() => navigate('/proveedores')}>Gestionar proveedores</button>
          <button onClick={() => navigate('/cotizaciones')}>Cotizaciones</button>
        </div>
      )}

      <hr />
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

