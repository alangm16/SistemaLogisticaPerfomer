import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login/Login';
import Empleados from './pages/Empleados';
import Clientes from './pages/Clientes'; 
import Proveedores from './pages/Proveedores'; 
import Cotizaciones from './pages/Cotizaciones/Cotizaciones';
import NuevaCotizacion from './pages/Cotizaciones/NuevaCotizacion.jsx';
import DetallesCotizacion from './pages/Cotizaciones/DetallesCotizacion.jsx'
import ComparacionCotizaciones from './pages/Cotizaciones/ComparacionCotizaciones';
import Solicitudes from './pages/Solicitudes/Solicitudes';
import SolicitudesAsignadas from './pages/Solicitudes/SolicitudesAsignadas';
import NuevaSolicitud from './pages/Solicitudes/NuevaSolicitud';
import MisSolicitudes from './pages/Solicitudes/MisSolicitudes';
import Unauthorized from './pages/Unauthorized';
import Logout from './pages/Login/Logout';
import useIdleTimeout from './hooks/useIDleTimeout.js';

// PrivateRoute extendido con validación de rol
function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(rol)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

const IdleHandler = () => {
  useIdleTimeout(15);
  return null;
};

function App() {
  return (
    <Router>
      <IdleHandler />
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* Página de acceso denegado */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Dashboard accesible para cualquier usuario autenticado */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        {/* CRUD de Empleados (solo ADMIN) */}
        <Route path="/empleados" element={
          <PrivateRoute roles={['ADMIN']}>
            <Empleados />
          </PrivateRoute>
        } />
        {/* CRUD de Clientes (VENDEDOR y ADMIN) */}
        <Route path="/clientes" element={
          <PrivateRoute roles={['VENDEDOR','PRICING','ADMIN']}>
            <Clientes />
          </PrivateRoute>
        } /> 
        {/* CRUD de Proveedores (PRICING y ADMIN) */}
        <Route path="/proveedores" element={
          <PrivateRoute roles={['VENDEDOR','PRICING','ADMIN']}>
            <Proveedores />
          </PrivateRoute>
        } />
        {/* Cotizaciones (VENDEDOR y ADMIN) */}
        <Route path="/cotizaciones" element={ <PrivateRoute roles={['PRICING','VENDEDOR','ADMIN']}>
            <Cotizaciones />
          </PrivateRoute>
        } />
        <Route path="/cotizaciones/nueva" element={ <PrivateRoute roles={['PRICING']}>
          <NuevaCotizacion />
        </PrivateRoute>
        } />
        <Route path="/cotizaciones/:id" element={ <PrivateRoute roles={['PRICING','VENDEDOR','ADMIN']}>
          <DetallesCotizacion />
        </PrivateRoute> 
        } />
        <Route path="/cotizaciones/comparar" element={
          <PrivateRoute roles={['PRICING','VENDEDOR','ADMIN']}>
            <ComparacionCotizaciones />
          </PrivateRoute>
        } />
        <Route path="/solicitudes/nueva" element={<PrivateRoute roles={['VENDEDOR']}>
          <NuevaSolicitud />
        </PrivateRoute>} />
        <Route path="/solicitudes/mis-solicitudes" element={<PrivateRoute roles={['VENDEDOR','PRICING']}>
          <MisSolicitudes />
        </PrivateRoute>} />
        <Route path="/solicitudes/asignadas" element={
          <PrivateRoute roles={['PRICING', 'ADMIN','VENDEDOR']}>
            <SolicitudesAsignadas />
          </PrivateRoute>
        } />
        <Route path="/solicitudes" element={
          <PrivateRoute roles={['PRICING', 'ADMIN','VENDEDOR']}>
            <Solicitudes />
          </PrivateRoute>
        } />
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;