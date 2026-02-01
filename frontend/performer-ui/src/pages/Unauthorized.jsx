// frontend/src/pages/Unauthorized.jsx
import { Link } from 'react-router-dom';
import '../styles/generales.css';
import '../styles/dashboard.css';
import '../styles/unauthorized.css';

export default function Unauthorized() {
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');
  
  const getDashboardRoute = () => {
    switch(rol) {
      case 'VENDEDOR':
        return '/dashboard';
      case 'PRICING':
        return '/dashboard';
      case 'ADMIN':
        return '/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="dashboard-layout unauthorized-page">
      <div className="dashboard-content">
        <div className="unauthorized-container">
          {/* Icono de acceso denegado */}
          <div className="unauthorized-icon">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          
          {/* Título principal */}
          <h1 className="unauthorized-title">Acceso Denegado</h1>
          
          {/* Mensaje descriptivo */}
          <p className="unauthorized-message">
            No tienes permisos para acceder a esta sección.
          </p>
          
          {/* Detalles adicionales - versión compacta */}
          <div className="unauthorized-details">
            <div className="info-item">
              <i className="fa-solid fa-user"></i>
              <span className="info-label">Usuario:</span>
              <span className="info-value">{nombre || 'Invitado'}</span>
            </div>
            
            <div className="info-item">
              <i className="fa-solid fa-user-shield"></i>
              <span className="info-label">Rol:</span>
              <Badge type={rol?.toLowerCase() || 'default'}>
                {rol || 'No identificado'}
              </Badge>
            </div>
          </div>
          
          {/* Opciones de navegación */}
          <div className="unauthorized-actions">
            <Link to={getDashboardRoute()} className="btn btn-primary">
              <i className="fa-solid fa-arrow-left"></i>
              Volver al Dashboard
            </Link>
            
            <Link to="/" className="btn btn-outline">
              <i className="fa-solid fa-home"></i>
              Ir al Inicio
            </Link>
          </div>
          
          {/* Información de contacto para solicitar permisos */}
          <div className="unauthorized-contact">
            <i className="fa-solid fa-circle-info"></i>
            <span>Si necesitas acceso, contacta al administrador del sistema.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Badge reutilizable para mostrar el rol
function Badge({ type, children }) {
  const badgeTypes = {
    admin: 'badge-admin',
    pricing: 'badge-pricing',
    vendedor: 'badge-vendedor',
    default: 'badge-pendiente'
  };
  
  return (
    <span className={`badge ${badgeTypes[type] || badgeTypes.default}`}>
      {children}
    </span>
  );
}