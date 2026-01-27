// src/components/HistorialModal.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Badge from './Badge';
import '../styles/historial.css';
import '../styles/generales.css';

/**
 * Componente modal para mostrar historial de cambios
 * 
 * @param {Boolean} isOpen - Estado del modal
 * @param {Function} onClose - Función para cerrar
 * @param {String} tipoEntidad - 'SOLICITUD' o 'COTIZACION'
 * @param {Number} entidadId - ID de la entidad
 * @param {String} titulo - Título del modal
 */
export default function HistorialModal({ 
  isOpen, 
  onClose, 
  tipoEntidad, 
  entidadId, 
  titulo = "Historial de Cambios" 
}) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    if (isOpen && entidadId) {
      cargarHistorial();
    }
  }, [isOpen, entidadId, tipoEntidad]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      // Endpoint específico para historial de la entidad
      const res = await api.get(`/historial/${tipoEntidad}/${entidadId}`);
      setHistorial(res.data);

      // Obtener resumen (si el backend lo proporciona)
      try {
        const resResumen = await api.get(`/historial/resumen/${tipoEntidad}/${entidadId}`);
        setResumen(resResumen.data);
      } catch (err) {
        console.log('No se pudo cargar resumen:', err);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('No se pudo cargar el historial de cambios');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (timestamp) => {
    if (!timestamp) return '';
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconoAccion = (accion) => {
    const iconos = {
      'CREADO': 'fa-plus-circle',
      'ACTUALIZADO': 'fa-edit',
      'ESTADO_CAMBIADO': 'fa-exchange-alt',
      'ASIGNADO': 'fa-user-plus',
      'ELIMINADO': 'fa-trash',
      'REUTILIZADA': 'fa-recycle',
      'ENVIADO': 'fa-paper-plane',
      'COMPLETADO': 'fa-check-circle',
      'CANCELADO': 'fa-ban'
    };
    return iconos[accion] || 'fa-history';
  };

  const getColorAccion = (accion) => {
    const colores = {
      'CREADO': 'success',
      'ACTUALIZADO': 'primary',
      'ESTADO_CAMBIADO': 'warning',
      'ASIGNADO': 'info',
      'ELIMINADO': 'danger',
      'REUTILIZADA': 'secondary',
      'ENVIADO': 'enviado',
      'COMPLETADO': 'completado',
      'CANCELADO': 'cancelado'
    };
    return colores[accion] || 'default';
  };

  const parseDetalle = (detalle) => {
    if (!detalle) return '';
    
    try {
      // Intentar parsear como JSON
      if (detalle.startsWith('{') || detalle.startsWith('[')) {
        const jsonData = JSON.parse(detalle);
        
        // Formatear según el tipo de acción
        if (jsonData.estado_anterior && jsonData.estado_nuevo) {
          return `Estado cambiado de "${jsonData.estado_anterior}" a "${jsonData.estado_nuevo}"`;
        }
        
        if (jsonData.folio) {
          return `Creado con folio ${jsonData.folio}`;
        }
        
        // Mostrar como texto plano si no hay formato específico
        return JSON.stringify(jsonData, null, 2);
      }
      
      return detalle;
    } catch (e) {
        console.log(e);
      return detalle;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-history"></i> {titulo}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Resumen */}
          {resumen && (
            <div className="historial-resumen">
              <div className="resumen-grid">
                <div className="resumen-item">
                  <div className="resumen-label">Total de Cambios</div>
                  <div className="resumen-value">{resumen.totalCambios || 0}</div>
                </div>
                {resumen.ultimoCambio && (
                  <div className="resumen-item">
                    <div className="resumen-label">Último Cambio</div>
                    <div className="resumen-value">
                      {formatFecha(resumen.ultimoCambio.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Historial */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          ) : historial.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-history"></i>
              <p>No hay registros de historial</p>
            </div>
          ) : (
            <div className="historial-timeline">
              {historial
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((item, index) => (
                  <div key={item.id || index} className="timeline-item">
                    <div className="timeline-marker">
                      <i className={`fa-solid ${getIconoAccion(item.accion)}`}></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="timeline-action">
                          <Badge type={getColorAccion(item.accion)}>
                            {item.accion.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="timeline-date">
                          {formatFecha(item.timestamp)}
                        </div>
                      </div>
                      
                      <div className="timeline-body">
                        <div className="timeline-detail">
                          <strong>Usuario:</strong> {item.usuario?.nombre || 'Sistema'}
                        </div>
                        {item.detalle && (
                          <div className="timeline-detail">
                            <strong>Detalles:</strong> {parseDetalle(item.detalle)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            <i className="fa-solid fa-times"></i> Cerrar
          </button>
          <button className="btn btn-primary" onClick={cargarHistorial}>
            <i className="fa-solid fa-sync-alt"></i> Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}