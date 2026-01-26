// src/components/SugerenciasCotizacion.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import Badge from './Badge';
import '../styles/cotizaciones.css';

export default function SugerenciasCotizacion({ solicitudId, onReutilizar }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (solicitudId) {
      cargarSugerencias();
    } else {
      setSugerencias([]);
    }
  }, [solicitudId]);

  const cargarSugerencias = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cotizaciones/sugerencias-avanzadas?solicitudId=${solicitudId}`);
      setSugerencias(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const handleReutilizar = async (sugerencia) => {
    const result = await Swal.fire({
      title: '¿Reutilizar esta cotización?',
      text: 'Esta acción creará una nueva cotización basada en la sugerencia seleccionada.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reutilizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5b4cdb',
    });

    if (!result.isConfirmed) return;

    if (onReutilizar) {
      onReutilizar(sugerencia);
    }
  };

  if (!solicitudId) return null;

    // Función para calcular días hasta que expira
    const calcularDiasValidos = (fecha) => {
        if (!fecha) return 'N/A';
        
        try {
            const hoy = new Date();
            const validoHasta = new Date(fecha);
            
            // Si la fecha es inválida
            if (isNaN(validoHasta.getTime())) {
                return 'N/A';
            }
            
            const diffTime = validoHasta - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                return `${diffDays} días`;
            } else if (diffDays === 0) {
                return 'Hoy vence';
            } else {
                return 'Expirado';
            }
        } catch (error) {
            console.error('Error calculando días válidos:', error);
            return 'N/A';
        }
    };

  // Función para obtener tipo de servicio según tipo de transporte
  const getTipoServicio = (tipoTransporte, tipoUnidad = '') => {
        // Si tenemos tipoUnidad específico, usarlo
        if (tipoUnidad) {
            return tipoUnidad;
        }
        
        // Si no, usar valores por defecto
        switch (tipoTransporte) {
            case 'AEREO':
                return 'Carga General';
            case 'MARITIMO':
                return 'Contenedor';
            case 'TERRESTRE':
                return 'Trailer';
            default:
                return 'Carga General';
        }
    };

  // Agrupar sugerencias por tipo de transporte
  const sugerenciasPorTipo = {
    AEREO: sugerencias.filter(s => s.tipoTransporte === 'AEREO').slice(0, 1),
    MARITIMO: sugerencias.filter(s => s.tipoTransporte === 'MARITIMO').slice(0, 1),
    TERRESTRE: sugerencias.filter(s => s.tipoTransporte === 'TERRESTRE').slice(0, 1),
  };

  // Si no hay sugerencias para algún tipo, mostramos una tarjeta vacía
  const tiposTransporte = ['AEREO', 'MARITIMO', 'TERRESTRE'];

  if (loading) {
    return (
      <div className="sugerencias-section">
        <div className="sugerencias-header">
          <div className="sugerencias-title">
            <i className="fa-solid fa-lightbulb"></i>
            Sugerencias de Cotización
          </div>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Buscando sugerencias similares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sugerencias-section">
      <div className="sugerencias-header">
        <div className="sugerencias-title">
          <i className="fa-solid fa-lightbulb"></i>
          Sugerencias de Cotización
        </div>
        {sugerencias.length > 0 && (
          <div className="sugerencias-count">{sugerencias.length} encontradas</div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="sugerencias-grid">
          {tiposTransporte.map((tipo) => {
            const sugerencia = sugerenciasPorTipo[tipo]?.[0];
            
            if (sugerencia) {
              return (
                <div key={sugerencia.id} className="sugerencia-card">
                  <div className="sugerencia-header">
                    <div className="sugerencia-tipo">
                      <Badge type={tipo.toLowerCase()}>
                        {tipo === 'AEREO' ? 'AÉREA' : 
                         tipo === 'MARITIMO' ? 'MARÍTIMA' : 'TERRESTRE'}
                      </Badge>
                      <div className="sugerencia-puntuacion">
                        <i className="fa-solid fa-star"></i>
                        {sugerencia.puntuacion.toFixed(0)}%
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => handleReutilizar(sugerencia)}
                      title="Reutilizar esta cotización"
                    >
                      <i className="fa-solid fa-recycle"></i>
                      Reutilizar
                    </button>
                  </div>

                  <div className="sugerencia-body">
                    <div className="sugerencia-info-group">
                      <div className="sugerencia-info-label">
                        <i className="fa-solid fa-building"></i>
                        PROVEEDOR
                      </div>
                      <div className="sugerencia-info-value">
                        {sugerencia.proveedorNombre}
                      </div>
                    </div>

                    <div className="sugerencia-info-group">
                      <div className="sugerencia-info-label">
                        <i className="fa-solid fa-route"></i>
                        ORIGEN-DESTINO
                      </div>
                      <div className="sugerencia-info-value">
                        {sugerencia.origen} - {sugerencia.destino}
                      </div>
                    </div>

                    <div className="sugerencia-info-group">
                        <div className="sugerencia-info-label">
                            <i className="fa-solid fa-calendar-check"></i>
                            VÁLIDO HASTA
                        </div>
                        <div className="sugerencia-info-value">
                            {calcularDiasValidos(sugerencia.validoHasta)}
                        </div>
                    </div>

                    <div className="sugerencia-details-grid">
                      <div className="sugerencia-detail">
                        <div className="sugerencia-detail-label">TIPO</div>
                        <div className="sugerencia-detail-value">
                          {getTipoServicio(tipo, sugerencia.tipoUnidad)}
                        </div>
                      </div>

                      <div className="sugerencia-info-group">
                            <div className="sugerencia-info-label">
                                <i className="fa-solid fa-clock"></i>
                                TIEMPO
                            </div>
                            <div className="sugerencia-info-value">
                                {sugerencia.tiempoEstimado || 'No especificado'}
                            </div>
                       </div>

                      <div className="sugerencia-detail">
                        <div className="sugerencia-detail-label">COSTO</div>
                        <div className="sugerencia-detail-value costo">
                          ${sugerencia.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="sugerencia-razon">
                      <i className="fa-solid fa-info-circle"></i>
                      {sugerencia.razon}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Tarjeta vacía para tipos sin sugerencias
              return (
                <div key={tipo} className="sugerencia-card sugerencia-empty">
                  <div className="sugerencia-header">
                    <Badge type={tipo.toLowerCase()}>
                      {tipo === 'AEREO' ? 'AÉREA' : 
                       tipo === 'MARITIMO' ? 'MARÍTIMA' : 'TERRESTRE'}
                    </Badge>
                  </div>
                  <div className="sugerencia-body-empty">
                    <i className="fa-solid fa-search"></i>
                    <p>No hay sugerencias para este tipo de transporte</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}