// src/components/MainContent.jsx
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

export default function MainContent({ rol, nombre }) {
  const navigate = useNavigate();

  // Módulos disponibles según el rol
  const modulosPorRol = {
    ADMIN: [
      { 
        label: 'Empleados', 
        path: '/empleados', 
        icon: 'fa-user-tie',
        description: 'Gestionar empleados de la empresa'
      },
      { 
        label: 'Clientes', 
        path: '/clientes', 
        icon: 'fa-building',
        description: 'Base de datos de clientes'
      },
      { 
        label: 'Proveedores', 
        path: '/proveedores', 
        icon: 'fa-truck',
        description: 'Gestionar proveedores de servicios'
      },
      { 
        label: 'Solicitudes', 
        path: '/solicitudes', 
        icon: 'fa-file-alt',
        description: 'Ver todas las solicitudes'
      },
      { 
        label: 'Cotizaciones', 
        path: '/cotizaciones', 
        icon: 'fa-calculator',
        description: 'Historial de cotizaciones'
      },
    ],
    PRICING: [
      { 
        label: 'Solicitudes', 
        path: '/solicitudes', 
        icon: 'fa-file-alt',
        description: 'Crear y gestionar solicitudes'
      },
      { 
        label: 'Mis Solicitudes', 
        path: '/solicitudes/mis-solicitudes', 
        icon: 'fa-folder-open',
        description: 'Solicitudes que estoy gestionando'
      },
      { 
        label: 'Solicitudes Asignadas', 
        path: '/solicitudes/asignadas', 
        icon: 'fa-tasks',
        description: 'Solicitudes asignadas a mí'
      },
      { 
        label: 'Proveedores', 
        path: '/proveedores', 
        icon: 'fa-truck',
        description: 'Gestionar proveedores'
      },
      { 
        label: 'Cotizaciones', 
        path: '/cotizaciones', 
        icon: 'fa-calculator',
        description: 'Crear y ver cotizaciones'
      },
    ],
    VENDEDOR: [
      { 
        label: 'Nueva Solicitud', 
        path: '/solicitudes/nueva', 
        icon: 'fa-plus-circle',
        description: 'Crear una nueva solicitud'
      },
      { 
        label: 'Mis Solicitudes', 
        path: '/solicitudes/mis-solicitudes', 
        icon: 'fa-folder-open',
        description: 'Solicitudes que he creado'
      },
      { 
        label: 'Solicitudes Asignadas', 
        path: '/solicitudes/asignadas', 
        icon: 'fa-tasks',
        description: 'Solicitudes asignadas a mí'
      },
      { 
        label: 'Clientes', 
        path: '/clientes', 
        icon: 'fa-building',
        description: 'Gestionar mis clientes'
      },
      { 
        label: 'Proveedores', 
        path: '/proveedores', 
        icon: 'fa-truck',
        description: 'Gestionar proveedores'
      },
      { 
        label: 'Cotizaciones Recientes', 
        path: '/cotizaciones', 
        icon: 'fa-clock',
        description: 'Ver cotizaciones recientes'
      },
    ],
  };

  const modulos = modulosPorRol[rol] || [];

  const getMensajeBienvenida = () => {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <main className="main-panel">
      <div className="main-welcome">
        <h2>{getMensajeBienvenida()}, {nombre}!</h2>
        <p>Panel de control - Rol: <strong>{rol}</strong></p>
      </div>

      <div className="module-grid">
        {modulos.map((modulo) => (
          <div 
            key={modulo.path} 
            className="module-card"
            onClick={() => navigate(modulo.path)}
          >
            <div className="module-icon">
              <i className={`fa-solid ${modulo.icon}`}></i>
            </div>
            <div className="module-title">{modulo.label}</div>
            <div className="module-description">{modulo.description}</div>
          </div>
        ))}
      </div>
    </main>
  );
}