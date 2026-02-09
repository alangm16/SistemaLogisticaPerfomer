// src/components/ComparadorCotizaciones.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Badge from './Badge';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import '../styles/comparador-cotizaciones.css';

export default function ComparadorCotizaciones({ solicitudId, onSeleccionar }) {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('tabla'); // 'tabla' o 'tarjetas'
  const [ordenarPor, setOrdenarPor] = useState('costo'); // 'costo', 'margen', 'roi'

  useEffect(() => {
    cargarComparacion();
  }, [solicitudId]);

  const cargarComparacion = async () => {
    if (!solicitudId) return;

    setLoading(true);
    try {
      const response = await api.get(`/cotizaciones/comparar?solicitudId=${solicitudId}`);
      setCotizaciones(response.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la comparación de cotizaciones',
      });
    } finally {
      setLoading(false);
    }
  };

  const cotizacionesOrdenadas = () => {
    const copia = [...cotizaciones];
    
    switch (ordenarPor) {
      case 'costo':
        return copia.sort((a, b) => (a.costoProveedor || 0) - (b.costoProveedor || 0));
      case 'margen':
        return copia.sort((a, b) => (b.margenGananciaPct || 0) - (a.margenGananciaPct || 0));
      case 'roi':
        return copia.sort((a, b) => (b.roi || 0) - (a.roi || 0));
      default:
        return copia;
    }
  };

  const seleccionarCotizacion = (cotizacion) => {
    if (onSeleccionar) {
      onSeleccionar(cotizacion);
    }
  };

  // Componentes internos
  const CompetitividadBadge = ({ nivel }) => {
    const config = {
      'MUY COMPETITIVO': { type: 'success', icon: 'fa-star' },
      'COMPETITIVO': { type: 'info', icon: 'fa-thumbs-up' },
      'POCO COMPETITIVO': { type: 'warning', icon: 'fa-exclamation' }
    };

    const badge = config[nivel] || { type: 'default', icon: 'fa-question' };

    return (
      <span className={`competitividad-badge badge-${badge.type}`}>
        <i className={`fa-solid ${badge.icon}`}></i>
        {nivel || 'N/A'}
      </span>
    );
  };

  const VigenciaBadge = ({ estado, dias }) => {
    const config = {
      'VIGENTE': { type: 'success', icon: 'fa-check-circle' },
      'PRÓXIMO A VENCER': { type: 'warning', icon: 'fa-clock' },
      'VENCIDO': { type: 'danger', icon: 'fa-times-circle' },
      'SIN FECHA': { type: 'default', icon: 'fa-question-circle' }
    };

    const badge = config[estado] || { type: 'default', icon: 'fa-question' };

    return (
      <span className={`vigencia-badge badge-${badge.type}`}>
        <i className={`fa-solid ${badge.icon}`}></i>
        {estado}
        {dias !== null && dias >= 0 && ` (${dias}d)`}
      </span>
    );
  };

  const RankingBadge = ({ ranking }) => {
    if (!ranking) return <span className="ranking-badge">-</span>;

    const medallas = {
      1: { icon: 'fa-medal', color: '#FFD700' }, // Oro
      2: { icon: 'fa-medal', color: '#C0C0C0' }, // Plata
      3: { icon: 'fa-medal', color: '#CD7F32' }  // Bronce
    };

    const medalla = medallas[ranking];

    return (
      <span className="ranking-badge">
        {medalla ? (
          <i className={`fa-solid ${medalla.icon}`} style={{ color: medalla.color }}></i>
        ) : (
          `#${ranking}`
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="comparador-loading">
        <div className="spinner"></div>
        <p>Cargando comparación...</p>
      </div>
    );
  }

  if (cotizaciones.length === 0) {
    return (
      <div className="comparador-vacio">
        <i className="fa-solid fa-inbox"></i>
        <p>No hay cotizaciones para comparar</p>
      </div>
    );
  }

  return (
    <div className="comparador-cotizaciones">
      {/* Header con controles */}
      <div className="comparador-header">
        <div className="comparador-title">
          <h3>
            <i className="fa-solid fa-chart-bar"></i>
            Comparación de Cotizaciones
          </h3>
          <span className="cotizaciones-count">{cotizaciones.length} cotizaciones</span>
        </div>

        <div className="comparador-controles">
          {/* Ordenar por */}
          <div className="control-group">
            <label>Ordenar por:</label>
            <select 
              value={ordenarPor} 
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="select-ordenar"
            >
              <option value="costo">Menor Costo</option>
              <option value="margen">Mayor Margen</option>
              <option value="roi">Mayor ROI</option>
            </select>
          </div>

          {/* Vista */}
          <div className="control-group">
            <label>Vista:</label>
            <div className="vista-toggle">
              <button
                className={`btn-vista ${vista === 'tabla' ? 'active' : ''}`}
                onClick={() => setVista('tabla')}
                title="Vista de tabla"
              >
                <i className="fa-solid fa-table"></i>
              </button>
              <button
                className={`btn-vista ${vista === 'tarjetas' ? 'active' : ''}`}
                onClick={() => setVista('tarjetas')}
                title="Vista de tarjetas"
              >
                <i className="fa-solid fa-th-large"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista de Tabla */}
      {vista === 'tabla' && (
        <div className="tabla-comparacion-wrapper">
          <table className="tabla-comparacion">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Tipo Transporte</th>
                <th>Ruta</th>
                <th>Costo</th>
                <th>Margen %</th>
                <th>Precio Venta</th>
                <th>Utilidad</th>
                <th>ROI %</th>
                <th>Rankings</th>
                <th>Competitividad</th>
                <th>Vigencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesOrdenadas().map((cot) => (
                <tr key={cot.id}>
                  <td>
                    <div className="proveedor-info">
                      <strong>{cot.proveedorNombre}</strong>
                      {cot.proveedorPais && <small>{cot.proveedorPais}</small>}
                    </div>
                  </td>
                  <td>
                    <Badge type={cot.tipoTransporte?.toLowerCase()}>
                      {cot.tipoTransporte}
                    </Badge>
                  </td>
                  <td>
                    <div className="ruta-info">
                      <small>{cot.origen}</small>
                      <i className="fa-solid fa-arrow-right"></i>
                      <small>{cot.destino}</small>
                    </div>
                  </td>
                  <td className="valor-destacado">
                    ${cot.costoProveedor?.toLocaleString('es-MX')}
                  </td>
                  <td>
                    <span className={`margen-valor ${
                      cot.margenGananciaPct >= 20 ? 'alto' :
                      cot.margenGananciaPct >= 10 ? 'medio' : 'bajo'
                    }`}>
                      {cot.margenGananciaPct?.toFixed(2) || 'N/A'}%
                    </span>
                  </td>
                  <td>
                    {cot.precioVenta ? 
                      `$${cot.precioVenta.toLocaleString('es-MX')}` : 
                      'N/A'}
                  </td>
                  <td className="valor-utilidad">
                    {cot.utilidadEstimada ? 
                      `$${cot.utilidadEstimada.toLocaleString('es-MX')}` : 
                      'N/A'}
                  </td>
                  <td>
                    <span className={`roi-valor ${
                      cot.roi >= 20 ? 'alto' :
                      cot.roi >= 10 ? 'medio' : 'bajo'
                    }`}>
                      {cot.roi?.toFixed(2) || 'N/A'}%
                    </span>
                  </td>
                  <td>
                    <div className="rankings-cell">
                      <div className="ranking-item" title="Ranking por costo">
                        <i className="fa-solid fa-dollar-sign"></i>
                        <RankingBadge ranking={cot.rankingPorCosto} />
                      </div>
                      <div className="ranking-item" title="Ranking por margen">
                        <i className="fa-solid fa-percent"></i>
                        <RankingBadge ranking={cot.rankingPorMargen} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <CompetitividadBadge nivel={cot.nivelCompetitividad} />
                  </td>
                  <td>
                    <VigenciaBadge 
                      estado={cot.estadoVigencia} 
                      dias={cot.diasVigenciaRestantes} 
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => seleccionarCotizacion(cot)}
                      title="Seleccionar cotización"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista de Tarjetas */}
      {vista === 'tarjetas' && (
        <div className="tarjetas-comparacion">
          {cotizacionesOrdenadas().map((cot) => (
            <div key={cot.id} className="tarjeta-cotizacion">
              <div className="tarjeta-header">
                <div className="tarjeta-proveedor">
                  <h4>{cot.proveedorNombre}</h4>
                  <Badge type={cot.tipoTransporte?.toLowerCase()}>
                    {cot.tipoTransporte}
                  </Badge>
                </div>
                <CompetitividadBadge nivel={cot.nivelCompetitividad} />
              </div>

              <div className="tarjeta-ruta">
                <div className="ruta-item">
                  <i className="fa-solid fa-map-marker-alt"></i>
                  <span>{cot.origen}</span>
                </div>
                <i className="fa-solid fa-arrow-down ruta-arrow"></i>
                <div className="ruta-item">
                  <i className="fa-solid fa-flag-checkered"></i>
                  <span>{cot.destino}</span>
                </div>
              </div>

              <div className="tarjeta-metricas">
                <div className="metrica">
                  <label>Costo Proveedor</label>
                  <span className="valor-principal">
                    ${cot.costoProveedor?.toLocaleString('es-MX')}
                  </span>
                </div>

                <div className="metrica">
                  <label>Margen</label>
                  <span className={`valor ${
                    cot.margenGananciaPct >= 20 ? 'alto' :
                    cot.margenGananciaPct >= 10 ? 'medio' : 'bajo'
                  }`}>
                    {cot.margenGananciaPct?.toFixed(2) || 'N/A'}%
                  </span>
                </div>

                <div className="metrica">
                  <label>Precio Venta</label>
                  <span className="valor">
                    {cot.precioVenta ? 
                      `$${cot.precioVenta.toLocaleString('es-MX')}` : 
                      'N/A'}
                  </span>
                </div>

                <div className="metrica">
                  <label>Utilidad</label>
                  <span className="valor-utilidad">
                    {cot.utilidadEstimada ? 
                      `$${cot.utilidadEstimada.toLocaleString('es-MX')}` : 
                      'N/A'}
                  </span>
                </div>

                <div className="metrica">
                  <label>ROI</label>
                  <span className={`valor ${
                    cot.roi >= 20 ? 'alto' :
                    cot.roi >= 10 ? 'medio' : 'bajo'
                  }`}>
                    {cot.roi?.toFixed(2) || 'N/A'}%
                  </span>
                </div>
              </div>

              <div className="tarjeta-footer">
                <div className="tarjeta-info">
                  <div className="info-item">
                    <i className="fa-solid fa-truck"></i>
                    {cot.tipoUnidad || 'No especificado'}
                  </div>
                  {cot.tiempoEstimado && (
                    <div className="info-item">
                      <i className="fa-solid fa-clock"></i>
                      {cot.tiempoEstimado}
                    </div>
                  )}
                </div>

                <div className="tarjeta-vigencia">
                  <VigenciaBadge 
                    estado={cot.estadoVigencia} 
                    dias={cot.diasVigenciaRestantes} 
                  />
                </div>

                <button
                  className="btn btn-primary btn-block"
                  onClick={() => seleccionarCotizacion(cot)}
                >
                  <i className="fa-solid fa-check"></i>
                  Seleccionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen estadístico */}
      <div className="resumen-comparacion">
        <div className="resumen-stat">
          <label>Costo Promedio:</label>
          <strong>
            ${(cotizaciones.reduce((acc, c) => acc + (c.costoProveedor || 0), 0) / cotizaciones.length).toLocaleString('es-MX', { maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="resumen-stat">
          <label>Margen Promedio:</label>
          <strong>
            {(cotizaciones.reduce((acc, c) => acc + (c.margenGananciaPct || 0), 0) / cotizaciones.length).toFixed(2)}%
          </strong>
        </div>
        <div className="resumen-stat">
          <label>ROI Promedio:</label>
          <strong>
            {(cotizaciones.reduce((acc, c) => acc + (c.roi || 0), 0) / cotizaciones.length).toFixed(2)}%
          </strong>
        </div>
      </div>
    </div>
  );
}

ComparadorCotizaciones.propTypes = {
  solicitudId: PropTypes.number.isRequired,
  onSeleccionar: PropTypes.func
};