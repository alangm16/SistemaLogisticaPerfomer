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
        return '/solicitudes/mis';
      case 'PRICING':
        return '/solicitudes';
      case 'ADMIN':
        return '/empleados';
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
          
          {/* Detalles adicionales */}
          <div className="unauthorized-details">
            <div className="info-card">
              <div className="info-item">
                <i className="fa-solid fa-user-shield"></i>
                <span>Rol Actual:</span>
                <Badge type={rol?.toLowerCase() || 'default'}>
                  {rol || 'No identificado'}
                </Badge>
              </div>
              
              <div className="info-item">
                <i className="fa-solid fa-user"></i>
                <span>Usuario:</span>
                <span className="info-value">{nombre || 'Invitado'}</span>
              </div>
              
              <div className="info-item">
                <i className="fa-solid fa-clock"></i>
                <span>Hora:</span>
                <span className="info-value">
                  {new Date().toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Opciones de navegación */}
          <div className="unauthorized-actions">
            <Link to={getDashboardRoute()} className="btn btn-primary">
              <i className="fa-solid fa-arrow-left"></i>
              Volver al Dashboard
            </Link>
            
            <Link to="/" className="btn btn-secondary">
              <i className="fa-solid fa-home"></i>
              Ir al Inicio
            </Link>
            
            <button 
              className="btn btn-outline"
              onClick={() => window.history.back()}
            >
              <i className="fa-solid fa-rotate-left"></i>
              Volver Atrás
            </button>
          </div>
          
          {/* Información de contacto para solicitar permisos */}
          <div className="unauthorized-contact">
            <p>
              <i className="fa-solid fa-circle-info"></i>
              Si necesitas acceso a esta sección, contacta al administrador del sistema.
            </p>
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