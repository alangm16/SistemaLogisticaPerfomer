// src/pages/Cotizaciones/DetallesCotizacion.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/cotizaciones.css';
import '../../styles/generales.css';

export default function DetallesCotizacion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({});

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    cargarCotizacion();
  }, [id]);

  const cargarCotizacion = async () => {
    try {
      const res = await api.get('/cotizaciones');
      const cotizacionEncontrada = res.data.find(c => c.id === parseInt(id));
      
      if (!cotizacionEncontrada) {
        Swal.fire({
          icon: 'error',
          title: 'No encontrada',
          text: 'La cotización no existe',
        });
        navigate('/cotizaciones');
        return;
      }

      setCotizacion(cotizacionEncontrada);
      setFormData({
        origen: cotizacionEncontrada.origen,
        destino: cotizacionEncontrada.destino,
        tipoUnidad: cotizacionEncontrada.tipoUnidad || '',
        tiempoEstimado: cotizacionEncontrada.tiempoEstimado || '',
        costo: cotizacionEncontrada.costo,
        validoHasta: cotizacionEncontrada.validoHasta || '',
        diasCredito: cotizacionEncontrada.diasCredito || '',
        margenGananciaPct: cotizacionEncontrada.margenGananciaPct || '',
        estado: cotizacionEncontrada.estado
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la cotización',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    const result = await Swal.fire({
      title: '¿Guardar cambios?',
      text: '¿Deseas guardar los cambios en esta cotización?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        ...cotizacion,
        origen: formData.origen,
        destino: formData.destino,
        tipoUnidad: formData.tipoUnidad,
        tiempoEstimado: formData.tiempoEstimado,
        costo: parseFloat(formData.costo),
        validoHasta: formData.validoHasta || null,
        diasCredito: formData.diasCredito ? parseInt(formData.diasCredito) : null,
        margenGananciaPct: formData.margenGananciaPct ? parseFloat(formData.margenGananciaPct) : null,
        estado: formData.estado
      };

      await api.put(`/cotizaciones/${id}`, payload);
      await cargarCotizacion();
      setModoEdicion(false);
      
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Los cambios se guardaron correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los cambios.',
      });
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const payload = {
        ...cotizacion,
        estado: nuevoEstado
      };
      
      await api.put(`/cotizaciones/${id}`, payload);
      await cargarCotizacion();
      
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La cotización ahora está ${nuevoEstado.toLowerCase()}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado.',
      });
    }
  };

  const eliminar = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar cotización?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/cotizaciones/${id}`);
      
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La cotización fue eliminada.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/cotizaciones');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la cotización.',
      });
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'badge-pendiente';
      case 'ENVIADO': return 'badge-activo';
      case 'COMPLETADO': return 'badge-vendedor';
      case 'CANCELADO': return 'badge-inactivo';
      default: return 'badge-default';
    }
  };

  const getTipoTransporteBadgeClass = (tipo) => {
    switch (tipo) {
      case 'TERRESTRE': return 'badge-terrestre';
      case 'MARITIMO': return 'badge-maritimo';
      case 'AEREO': return 'badge-aereo';
      default: return 'badge-default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'fa-hourglass-half';
      case 'ENVIADO': return 'fa-paper-plane';
      case 'COMPLETADO': return 'fa-check-circle';
      case 'CANCELADO': return 'fa-times-circle';
      default: return 'fa-circle';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <main className="main-panel">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando cotización...</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (!cotizacion) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar rol={rol} />
      <div className="dashboard-content">
        <Header nombre={nombre} rol={rol} />

        <div className="subheader">
          <div className="subheader-left">
            <button 
              className="btn-back"
              onClick={() => navigate('/cotizaciones')}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver
            </button>
            <h2 className="page-title-subheader">Detalles de Cotización</h2>
          </div>
        </div>

        <main className="main-panel">
          {/* Header de la cotización */}
          <div className="cotizacion-header">
            <div className="cotizacion-header-top">
              <div className="cotizacion-header-info">
                <h2>Cotización #{cotizacion.id}</h2>
                <p>Folio: {cotizacion.solicitud?.folioCodigo || 'N/A'}</p>
              </div>
              <div className="cotizacion-header-badges">
                <span className={`badge ${getTipoTransporteBadgeClass(cotizacion.tipoTransporte)}`}>
                  {cotizacion.tipoTransporte}
                </span>
                <span className={`badge ${getEstadoBadgeClass(cotizacion.estado)}`}>
                  <i className={`fa-solid ${getEstadoIcon(cotizacion.estado)} me-2`}></i>
                  {cotizacion.estado}
                </span>
              </div>
            </div>

            <div className="cotizacion-header-details">
              <div className="header-detail-item">
                <span className="header-detail-label">Costo</span>
                <span className="header-detail-value">${cotizacion.costo?.toLocaleString('es-MX')}</span>
              </div>
              <div className="header-detail-item">
                <span className="header-detail-label">Tiempo Estimado</span>
                <span className="header-detail-value">{cotizacion.tiempoEstimado || 'N/A'}</span>
              </div>
              <div className="header-detail-item">
                <span className="header-detail-label">Válido Hasta</span>
                <span className="header-detail-value">
                  {cotizacion.validoHasta ? new Date(cotizacion.validoHasta).toLocaleDateString('es-MX') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Contenedor principal de detalles */}
          <div className="detalles-container">
            {/* Columna principal */}
            <div className="detalles-main">
              {/* Información de la solicitud */}
              <div className="info-section-card">
                <div className="info-section-header">
                  <div className="info-section-icon">
                    <i className="fa-solid fa-file-alt"></i>
                  </div>
                  <h3 className="info-section-title">Información de Solicitud</h3>
                </div>
                <div className="info-section-body">
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-building"></i>
                      Cliente
                    </span>
                    <span className="info-row-value">{cotizacion.solicitud?.cliente?.nombre || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-barcode"></i>
                      Folio
                    </span>
                    <span className="info-row-value">{cotizacion.solicitud?.folioCodigo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-calendar"></i>
                      Fecha de Emisión
                    </span>
                    <span className="info-row-value">
                      {cotizacion.solicitud?.fechaEmision ? 
                        new Date(cotizacion.solicitud.fechaEmision).toLocaleDateString('es-MX') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del transporte */}
              {!modoEdicion ? (
                <div className="info-section-card">
                  <div className="info-section-header">
                    <div className="info-section-icon">
                      <i className="fa-solid fa-route"></i>
                    </div>
                    <h3 className="info-section-title">Detalles de Transporte</h3>
                  </div>
                  <div className="info-section-body">
                    <div className="info-row">
                      <span className="info-row-label">
                        <i className="fa-solid fa-map-marker-alt"></i>
                        Origen
                      </span>
                      <span className="info-row-value">{cotizacion.origen}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-row-label">
                        <i className="fa-solid fa-flag-checkered"></i>
                        Destino
                      </span>
                      <span className="info-row-value">{cotizacion.destino}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-row-label">
                        <i className="fa-solid fa-truck"></i>
                        Tipo de Unidad
                      </span>
                      <span className="info-row-value">{cotizacion.tipoUnidad || 'No especificado'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-row-label">
                        <i className="fa-solid fa-clock"></i>
                        Tiempo Estimado
                      </span>
                      <span className="info-row-value">{cotizacion.tiempoEstimado || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-section-card">
                  <div className="info-section-header">
                    <div className="info-section-icon">
                      <i className="fa-solid fa-edit"></i>
                    </div>
                    <h3 className="info-section-title">Editar Transporte</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-section">
                      <label>Origen *</label>
                      <input 
                        type="text" 
                        name="origen"
                        value={formData.origen}
                        onChange={handleInputChange}
                        className="select-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Destino *</label>
                      <input 
                        type="text" 
                        name="destino"
                        value={formData.destino}
                        onChange={handleInputChange}
                        className="select-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Tipo de Unidad</label>
                      <input 
                        type="text" 
                        name="tipoUnidad"
                        value={formData.tipoUnidad}
                        onChange={handleInputChange}
                        className="select-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Tiempo Estimado</label>
                      <input 
                        type="text" 
                        name="tiempoEstimado"
                        value={formData.tiempoEstimado}
                        onChange={handleInputChange}
                        className="select-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Costo (USD) *</label>
                      <input 
                        type="number" 
                        name="costo"
                        value={formData.costo}
                        onChange={handleInputChange}
                        className="select-input"
                        step="0.01"
                      />
                    </div>
                    <div className="form-section">
                      <label>Válido Hasta</label>
                      <input 
                        type="date" 
                        name="validoHasta"
                        value={formData.validoHasta}
                        onChange={handleInputChange}
                        className="select-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Días de Crédito</label>
                      <input 
                        type="number" 
                        name="diasCredito"
                        value={formData.diasCredito}
                        onChange={handleInputChange}
                        className="select-input"
                      />
                    </div>
                    <div className="form-section">
                      <label>Margen de Ganancia (%)</label>
                      <input 
                        type="number" 
                        name="margenGananciaPct"
                        value={formData.margenGananciaPct}
                        onChange={handleInputChange}
                        className="select-input"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar derecha */}
            <div className="detalles-sidebar">
              {/* Información del proveedor */}
              <div className="info-section-card">
                <div className="info-section-header">
                  <div className="info-section-icon">
                    <i className="fa-solid fa-truck"></i>
                  </div>
                  <h3 className="info-section-title">Proveedor</h3>
                </div>
                <div className="info-section-body">
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-building"></i>
                      Nombre
                    </span>
                    <span className="info-row-value">{cotizacion.proveedor?.nombre || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-envelope"></i>
                      Email
                    </span>
                    <span className="info-row-value">{cotizacion.proveedor?.email || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-phone"></i>
                      Teléfono
                    </span>
                    <span className="info-row-value">{cotizacion.proveedor?.telefono || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Información financiera */}
              <div className="info-section-card">
                <div className="info-section-header">
                  <div className="info-section-icon">
                    <i className="fa-solid fa-dollar-sign"></i>
                  </div>
                  <h3 className="info-section-title">Información Financiera</h3>
                </div>
                <div className="info-section-body">
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-money-bill-wave"></i>
                      Costo
                    </span>
                    <span className="info-row-value highlight">${cotizacion.costo?.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-percent"></i>
                      Margen
                    </span>
                    <span className="info-row-value">
                      {cotizacion.margenGananciaPct ? `${cotizacion.margenGananciaPct}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-row-label">
                      <i className="fa-solid fa-credit-card"></i>
                      Días de Crédito
                    </span>
                    <span className="info-row-value">{cotizacion.diasCredito || 0} días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="detalles-actions">
            {!modoEdicion ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => setModoEdicion(true)}
                >
                  <i className="fa-solid fa-edit"></i>
                  Editar
                </button>

                {cotizacion.estado === 'PENDIENTE' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => cambiarEstado('ENVIADO')}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    Marcar como Enviado
                  </button>
                )}

                {cotizacion.estado === 'ENVIADO' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => cambiarEstado('COMPLETADO')}
                  >
                    <i className="fa-solid fa-check"></i>
                    Marcar como Completado
                  </button>
                )}

                <button 
                  className="btn btn-danger"
                  onClick={eliminar}
                >
                  <i className="fa-solid fa-trash"></i>
                  Eliminar
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setModoEdicion(false);
                    setFormData({
                      origen: cotizacion.origen,
                      destino: cotizacion.destino,
                      tipoUnidad: cotizacion.tipoUnidad || '',
                      tiempoEstimado: cotizacion.tiempoEstimado || '',
                      costo: cotizacion.costo,
                      validoHasta: cotizacion.validoHasta || '',
                      diasCredito: cotizacion.diasCredito || '',
                      margenGananciaPct: cotizacion.margenGananciaPct || '',
                      estado: cotizacion.estado
                    });
                  }}
                >
                  <i className="fa-solid fa-times"></i>
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={guardarCambios}
                >
                  <i className="fa-solid fa-save"></i>
                  Guardar Cambios
                </button>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}