// src/components/Header.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';

export default function Header({ nombre, rol }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    // NO usar localStorage.clear() en artifacts, pero aquí es necesario por funcionalidad del sistema
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    navigate('/login');
  };

  // Obtener título de la página actual
  const getTituloPagina = () => {
    const path = location.pathname;
    const titulos = {
      '/dashboard': 'Dashboard',
      '/admin/usuarios': 'Gestión de Usuarios',
      '/empleados': 'Empleados',
      '/clientes': 'Clientes',
      '/proveedores': 'Proveedores',
      '/solicitudes': 'Solicitudes',
      '/cotizaciones': 'Cotizaciones',
      '/mis-solicitudes': 'Mis Solicitudes',
      '/solicitudes-asignadas': 'Solicitudes Asignadas',
    };
    return titulos[path] || 'Performer Logistics';
  };

  // Obtener iniciales del nombre
  const getIniciales = (nombre) => {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{getTituloPagina()}</h1>
        <div className="header-breadcrumb">
          <i className="fa-solid fa-house"></i>
          <span>/</span>
          <span>{getTituloPagina()}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Notificaciones */}
        <div className="header-notifications">
          <i className="fa-solid fa-bell"></i>
          <span className="notification-badge">3</span>
        </div>

        {/* Información del usuario */}
        <div className="user-info">
          <div className="user-avatar">{getIniciales(nombre)}</div>
          <div className="user-details">
            <span className="user-name">{nombre}</span>
            <span className="user-role">{rol}</span>
          </div>
        </div>

        {/* Botón de logout */}
        <button onClick={logout} className="logout-btn">
          <i className="fa-solid fa-right-from-bracket"></i>
          Salir
        </button>
      </div>
    </header>
  );
}