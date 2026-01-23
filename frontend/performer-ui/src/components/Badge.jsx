// src/components/Badge.jsx

/**
 * Componente de Badge con estilos predefinidos
 * 
 * @param {String} type - Tipo de badge (activo, inactivo, pendiente, admin, etc.)
 * @param {String} children - Contenido del badge
 * @param {String} icon - Ícono opcional
 */
export default function Badge({ type = 'default', children, icon }) {
  const badgeClasses = {
    'activo': 'badge-activo',
    'inactivo': 'badge-inactivo',
    'pendiente': 'badge-pendiente',
    'admin': 'badge-admin',
    'pricing': 'badge-pricing',
    'vendedor': 'badge-vendedor',
    'enviado': 'badge-enviado',
    'completado': 'badge-completado',
    'cancelado': 'badge-cancelado',
    'terrestre': 'badge-terrestre',
    'maritimo': 'badge-maritimo',
    'aereo': 'badge-aereo',
    'default': 'badge-default'
  };

  const className = badgeClasses[type.toLowerCase()] || badgeClasses.default;

  return (
    <span className={`badge ${className}`}>
      {icon && <i className={`fa-solid ${icon}`}></i>}
      {children}
    </span>
  );
}