// src/components/Paginacion.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/generales.css';

const Paginacion = ({ 
  paginaActual, 
  totalElementos, 
  elementosPorPagina, 
  onChangePagina,
  mostrarInfo = true,
  mostrarControles = true
}) => {
  // Calcular número total de páginas
  const totalPaginas = Math.ceil(totalElementos / elementosPorPagina);
  
  if (totalPaginas <= 1) return null;

  // Calcular índices de elementos mostrados
  const inicio = ((paginaActual - 1) * elementosPorPagina) + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, totalElementos);

  // Función para cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      onChangePagina(nuevaPagina);
    }
  };

  // Generar números de página a mostrar
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxBotones = 5;
    
    if (totalPaginas <= maxBotones) {
      // Mostrar todas las páginas si son 5 o menos
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis tácita
      if (paginaActual <= 3) {
        // Páginas 1-4 + última
        for (let i = 1; i <= 4; i++) {
          numeros.push(i);
        }
        if (paginaActual === 3) {
          numeros.push(5);
        }
      } else if (paginaActual >= totalPaginas - 2) {
        // Primera + páginas finales
        if (paginaActual === totalPaginas - 2) {
          numeros.push(totalPaginas - 4);
        }
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          numeros.push(i);
        }
      } else {
        // Páginas alrededor de la actual
        for (let i = paginaActual - 2; i <= paginaActual + 2; i++) {
          numeros.push(i);
        }
      }
    }
    
    return numeros;
  };

  return (
    <div className="paginacion-container">
      {mostrarInfo && (
        <div className="paginacion-info">
          Mostrando {inicio} - {fin} de {totalElementos} elementos
        </div>
      )}
      
      {mostrarControles && (
        <div className="paginacion-controls">
          {/* Botón primera página */}
          <button
            className="btn-paginacion"
            onClick={() => cambiarPagina(1)}
            disabled={paginaActual === 1}
            aria-label="Primera página"
          >
            <i className="fa-solid fa-angles-left"></i>
          </button>
          
          {/* Botón página anterior */}
          <button
            className="btn-paginacion"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            aria-label="Página anterior"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          {/* Números de página */}
          <div className="paginacion-numeros">
            {generarNumerosPagina().map((pagina) => (
              <button
                key={pagina}
                className={`btn-paginacion ${pagina === paginaActual ? 'active' : ''}`}
                onClick={() => cambiarPagina(pagina)}
                aria-label={`Página ${pagina}`}
                aria-current={pagina === paginaActual ? 'page' : undefined}
              >
                {pagina}
              </button>
            ))}
          </div>
          
          {/* Botón página siguiente */}
          <button
            className="btn-paginacion"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            aria-label="Página siguiente"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          
          {/* Botón última página */}
          <button
            className="btn-paginacion"
            onClick={() => cambiarPagina(totalPaginas)}
            disabled={paginaActual === totalPaginas}
            aria-label="Última página"
          >
            <i className="fa-solid fa-angles-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

Paginacion.propTypes = {
  paginaActual: PropTypes.number.isRequired,
  totalElementos: PropTypes.number.isRequired,
  elementosPorPagina: PropTypes.number.isRequired,
  onChangePagina: PropTypes.func.isRequired,
  mostrarInfo: PropTypes.bool,
  mostrarControles: PropTypes.bool,
};

export default Paginacion;