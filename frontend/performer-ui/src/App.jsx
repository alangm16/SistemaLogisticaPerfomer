import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Empleados from './pages/Empleados';
import Clientes from './pages/Clientes'; 
import NuevoCliente from './pages/NuevoCliente'; 
import EditarCliente from './pages/EditarCliente';
import Proveedores from './pages/Proveedores'; 
import NuevoProveedor from './pages/NuevoProveedor'; 
import EditarProveedor from './pages/EditarProveedor';
import Unauthorized from './pages/Unauthorized';
import Logout from './pages/Logout';

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

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

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
          <PrivateRoute roles={['VENDEDOR','ADMIN']}>
            <Clientes />
          </PrivateRoute>
        } /> 
        <Route path="/clientes/nuevo" element={
          <PrivateRoute roles={['VENDEDOR','ADMIN']}>
            <NuevoCliente />
          </PrivateRoute>
        } /> 
        <Route path="/clientes/:id/editar" element={
          <PrivateRoute roles={['VENDEDOR','ADMIN']}>
            <EditarCliente />
          </PrivateRoute>
        } />
        {/* CRUD de Proveedores (PRICING y ADMIN) */}
        <Route path="/proveedores" element={
          <PrivateRoute roles={['PRICING','ADMIN']}>
            <Proveedores />
          </PrivateRoute>
        } /> 
        <Route path="/proveedores/nuevo" element={
          <PrivateRoute roles={['PRICING','ADMIN']}>
            <NuevoProveedor />
          </PrivateRoute>
        } /> 
        <Route path="/proveedores/:id/editar" element={
          <PrivateRoute roles={['PRICING','ADMIN']}>
            <EditarProveedor />
          </PrivateRoute>
        } />

        {/* Página de acceso denegado */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
