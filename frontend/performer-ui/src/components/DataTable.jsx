// src/components/DataTable.jsx
/* import { useState } from 'react'; */

/**
 * Componente de tabla genérico y reutilizable
 * 
 * @param {Array} data - Datos a mostrar
 * @param {Array} columns - Configuración de columnas
 * @param {Function} onRowClick - Callback al hacer click en una fila
 * @param {Function} renderActions - Función para renderizar acciones personalizadas
 * @param {String} emptyMessage - Mensaje cuando no hay datos
 * @param {String} emptyIcon - Ícono cuando no hay datos
 */
export default function DataTable({ 
  data = [], 
  columns = [], 
  onRowClick,
  renderActions,
  emptyMessage = "No se encontraron registros",
  emptyIcon = "fa-inbox",
  rowClassName,
  emptyAction
}) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={col.headerStyle}>
                {col.header}
              </th>
            ))}
            {renderActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr 
              key={row.id || rowIdx}
              onClick={() => onRowClick?.(row)}
              style={onRowClick ? { cursor: 'pointer' } : {}}
              className={rowClassName?.(row)}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={col.cellStyle}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {renderActions && (
                <td onClick={(e) => e.stopPropagation()}>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="empty-state">
          <i className={`fa-solid ${emptyIcon}`}></i>
          <p>{emptyMessage}</p>
            {emptyAction}
        </div>
      )}
    </div>
  );
}