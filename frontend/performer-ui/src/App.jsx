import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Empleados from './pages/Empleados';
import NuevoEmpleado from './pages/NuevoEmpleado';
import EditarEmpleado from './pages/EditarEmpleado';
import Clientes from './pages/Clientes'; 
import NuevoCliente from './pages/NuevoCliente'; 
import EditarCliente from './pages/EditarCliente';
import Proveedores from './pages/Proveedores'; 
import NuevoProveedor from './pages/NuevoProveedor'; 
import EditarProveedor from './pages/EditarProveedor';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="/empleados" element={ <PrivateRoute>
              <Empleados />
            </PrivateRoute>
          } 
        />
        <Route path="/empleados/nuevo" element={ <PrivateRoute>
              <NuevoEmpleado />
            </PrivateRoute>
          } 
        />
        <Route path="/empleados/:id/editar" element={ <PrivateRoute>
              <EditarEmpleado />
            </PrivateRoute>
          } 
        />
        <Route path="/clientes" element={<PrivateRoute>
          <Clientes />
        </PrivateRoute>} /> 
        <Route path="/clientes/nuevo" element={<PrivateRoute>
            <NuevoCliente />
        </PrivateRoute>} /> 
        <Route path="/clientes/:id/editar" element={<PrivateRoute>
              <EditarCliente />
        </PrivateRoute>} />
        <Route path="/proveedores" element={<PrivateRoute>
          <Proveedores />
        </PrivateRoute>} /> 
        <Route path="/proveedores/nuevo" element={<PrivateRoute>
          <NuevoProveedor />
        </PrivateRoute>} /> 
        <Route path="/proveedores/:id/editar" element={<PrivateRoute>
          <EditarProveedor />
        </PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
