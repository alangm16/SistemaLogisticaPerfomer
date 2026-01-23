// src/components/DropdownActions.jsx

/**
 * Componente de dropdown para acciones de tabla
 * 
 * @param {Array} items - Array de acciones
 * Cada item puede tener: { label, icon, onClick, danger, divider }
 */
export default function DropdownActions({ items = [], buttonLabel = "Opciones" }) {
  return (
    <div className="dropdown">
      <button
        className="btn btn-sm btn-primary-app dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {buttonLabel}
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {items.map((item, idx) => {
          if (item.divider) {
            return <li key={idx}><hr className="dropdown-divider" /></li>;
          }
          
          if (item.hidden) return null;
          
          return (
            <li key={idx}>
              <button
                className={`dropdown-item ${item.danger ? 'text-danger' : ''}`}
                onClick={item.onClick}
              >
                <i className={`fa-solid ${item.icon} ${item.danger ? 'text-danger' : 'text-purple'} me-2`}></i>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}