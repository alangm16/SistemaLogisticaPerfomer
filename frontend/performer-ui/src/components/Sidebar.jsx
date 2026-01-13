// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';

export default function Sidebar({ rol }) {
  const location = useLocation();

  // Configuración de módulos por rol - DEBEN COINCIDIR CON MainContent
  const modulosPorRol = {
    ADMIN: [
      { label: 'Empleados', path: '/empleados', icon: 'fa-user-tie' },
      { label: 'Clientes', path: '/clientes', icon: 'fa-building' },
      { label: 'Proveedores', path: '/proveedores', icon: 'fa-truck' },
      { label: 'Solicitudes', path: '/solicitudes', icon: 'fa-file-alt' },
      { label: 'Cotizaciones', path: '/cotizaciones', icon: 'fa-calculator' },
    ],
    PRICING: [
      { label: 'Solicitudes', path: '/solicitudes', icon: 'fa-file-alt' },
      { label: 'Mis Solicitudes', path: '/mis-solicitudes', icon: 'fa-folder-open' },
      { label: 'Solicitudes Asignadas', path: '/solicitudes-asignadas', icon: 'fa-tasks' },
      { label: 'Proveedores', path: '/proveedores', icon: 'fa-truck' },
      { label: 'Cotizaciones', path: '/cotizaciones', icon: 'fa-calculator' },
    ],
    VENDEDOR: [
      { label: 'Nueva Solicitud', path: '/solicitudes/nueva', icon: 'fa-plus-circle' },
      { label: 'Mis Solicitudes', path: '/mis-solicitudes', icon: 'fa-folder-open' },
      { label: 'Solicitudes Asignadas', path: '/solicitudes-asignadas', icon: 'fa-tasks' },
      { label: 'Clientes', path: '/clientes', icon: 'fa-building' },
      { label: 'Cotizaciones Recientes', path: '/cotizaciones', icon: 'fa-clock' },
    ],
  };

  const modulos = modulosPorRol[rol] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="fa-solid fa-ship"></i>
        </div>
        <div className="sidebar-logo-text">Performer Logistics</div>
      </div>

      <nav>
        {modulos.map((modulo) => (
          <Link
            key={modulo.path}
            to={modulo.path}
            className={`sidebar-link ${location.pathname === modulo.path ? 'active' : ''}`}
          >
            <i className={`fa-solid ${modulo.icon}`}></i>
            <span className="sidebar-link-text">{modulo.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}