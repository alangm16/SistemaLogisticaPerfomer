// src/components/Subheader.jsx
import '../styles/dashboard.css';

export default function Subheader({ 
  titulo, 
  onAgregarClick, 
  busqueda, 
  onBusquedaChange,
  filtro,
  onFiltroChange,
  filtros // array de objetos: [{ valor: 'TODOS', label: 'Todos' }, ...]
}) {
  return (
    <div className="subheader">
      <div className="subheader-left">
        {titulo && <h2 className="page-title-subheader">{titulo}</h2>}
        
        {onBusquedaChange && (
          <div className="search-box-subheader">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda || ''}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
          </div>
        )}

        {filtros && filtros.length > 0 && (
          <div className="filter-buttons-subheader">
            {filtros.map((f) => (
              <button
                key={f.valor}
                className={`filter-btn-subheader ${filtro === f.valor ? 'active' : ''}`}
                onClick={() => onFiltroChange(f.valor)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {onAgregarClick && (
        <div className="subheader-right">
          <button className="btn-add" onClick={onAgregarClick}>
            <i className="fa-solid fa-plus"></i>
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}