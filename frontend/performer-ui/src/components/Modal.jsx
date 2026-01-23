// src/components/Modal.jsx

/**
 * Componente de Modal genérico
 * 
 * @param {Boolean} isOpen - Estado del modal
 * @param {Function} onClose - Función para cerrar
 * @param {String} title - Título del modal
 * @param {ReactNode} children - Contenido
 * @param {ReactNode} footer - Contenido del footer
 * @param {Boolean} large - Modal grande
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  large = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${large ? 'modal-content-large' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}