// src/pages/Cotizaciones/DetallesCotizacion.jsx - VERSIÓN OPTIMIZADA
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import FormField from '../../components/FormField';
import HistorialModal from '../../components/HistorialModal';
import useWorkflow from '../../hooks/useWorkflow';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/cotizaciones.css';
import '../../styles/generales.css';
import Cotizaciones from './Cotizaciones';

export default function DetallesCotizacion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    tipoUnidad: '',
    tiempoEstimado: '',
    costo: 0,
    validoHasta: '',
    diasCredito: '',
    margenGananciaPct: '',
    estado: ''
  });

  const { validarTransicion } = useWorkflow();

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => { cargarCotizacion(); }, [id]);

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
        origen: cotizacionEncontrada.origen || '',
        destino: cotizacionEncontrada.destino || '',
        tipoUnidad: cotizacionEncontrada.tipoUnidad || '',
        tiempoEstimado: cotizacionEncontrada.tiempoEstimado || '',
        costo: cotizacionEncontrada.costo || 0,
        validoHasta: cotizacionEncontrada.validoHasta || '',
        diasCredito: cotizacionEncontrada.diasCredito || '',
        margenGananciaPct: cotizacionEncontrada.margenGananciaPct || '',
        estado: cotizacionEncontrada.estado || ''
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
        ...formData,
        costo: parseFloat(formData.costo),
        diasCredito: formData.diasCredito ? parseInt(formData.diasCredito) : null,
        margenGananciaPct: formData.margenGananciaPct ? parseFloat(formData.margenGananciaPct) : null,
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

    // Validar workflow
    const entidad = location.pathname.includes('cotizaciones') ? 'COTIZACION' : 'SOLICITUD';
    const estadoActual = cotizacion.find(s => s.id === id)?.estado;
    
    if (!validarTransicion(entidad, estadoActual, nuevoEstado)) {
      Swal.fire({
        icon: 'error',
        title: 'Transición no permitida',
        text: `No se puede cambiar de ${estadoActual} a ${nuevoEstado}`,
      });
      return;
    }
      const payload = { ...cotizacion, estado: nuevoEstado };
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

  // Componentes reutilizables internos
  const InfoCard = ({ title, icon, children }) => (
    <div className="info-section-card">
      <div className="info-section-header">
        <div className="info-section-icon">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <h3 className="info-section-title">{title}</h3>
      </div>
      <div className="info-section-body">{children}</div>
    </div>
  );

  const InfoRow = ({ icon, label, value, highlight = false }) => (
    <div className="info-row">
      <span className="info-row-label">
        <i className={`fa-solid ${icon}`}></i>
        {label}
      </span>
      <span className={`info-row-value ${highlight ? 'highlight' : ''}`}>
        {value}
      </span>
    </div>
  );

  const HeaderDetail = ({ label, value }) => (
    <div className="header-detail-item">
      <span className="header-detail-label">{label}</span>
      <span className="header-detail-value">{value}</span>
    </div>
  );

  const ActionButtonHistorial = () => (
    <button 
      className="btn btn-secondary"
      onClick={() => setModalHistorial(true)}
      style={{ marginLeft: 'auto' }}
    >
      <i className="fa-solid fa-history"></i>
      Ver Historial Completo
    </button>
  );

  const ActionButton = ({ onClick, icon, label, type = 'primary' }) => (
    <button className={`btn btn-${type}`} onClick={onClick}>
      <i className={`fa-solid ${icon}`}></i>
      {label}
    </button>
  );

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
            <ActionButton
              onClick={() => navigate('/cotizaciones')}
              icon="fa-arrow-left"
              label="Volver"
              type="secondary"
            />
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
                <Badge type={cotizacion.tipoTransporte?.toLowerCase()}>
                  {cotizacion.tipoTransporte}
                </Badge>
                <Badge 
                  type={cotizacion.estado?.toLowerCase()} 
                  icon={cotizacion.estado === 'PENDIENTE' ? 'fa-hourglass-half' :
                        cotizacion.estado === 'ENVIADO' ? 'fa-paper-plane' :
                        cotizacion.estado === 'COMPLETADO' ? 'fa-check-circle' : 'fa-times-circle'}
                >
                  {cotizacion.estado}
                </Badge>
              </div>
            </div>

            <div className="cotizacion-header-details">
              <HeaderDetail 
                label="Costo" 
                value={`$${cotizacion.costo?.toLocaleString('es-MX') || '0'}`} 
              />
              <HeaderDetail 
                label="Tiempo Estimado" 
                value={cotizacion.tiempoEstimado || 'N/A'} 
              />
              <HeaderDetail 
                label="Válido Hasta" 
                value={cotizacion.validoHasta ? 
                  new Date(cotizacion.validoHasta).toLocaleDateString('es-MX') : 'N/A'} 
              />
            </div>
          </div>

          {/* Contenedor principal de detalles */}
          <div className="detalles-container">
            {/* Columna principal */}
            <div className="detalles-main">
              {/* Información de la solicitud */}
              <InfoCard title="Información de Solicitud" icon="fa-file-alt">
                <InfoRow icon="fa-building" label="Cliente" 
                  value={cotizacion.solicitud?.cliente?.nombre || 'N/A'} />
                <InfoRow icon="fa-barcode" label="Folio" 
                  value={cotizacion.solicitud?.folioCodigo || 'N/A'} />
                <InfoRow icon="fa-calendar" label="Fecha de Emisión" 
                  value={cotizacion.solicitud?.fechaEmision ? 
                    new Date(cotizacion.solicitud.fechaEmision).toLocaleDateString('es-MX') : 'N/A'} />
              </InfoCard>

              {/* Información del transporte */}
              <InfoCard 
                title={modoEdicion ? "Editar Transporte" : "Detalles de Transporte"} 
                icon={modoEdicion ? "fa-edit" : "fa-route"}
              >
                {!modoEdicion ? (
                  <>
                    <InfoRow icon="fa-map-marker-alt" label="Origen" value={cotizacion.origen} />
                    <InfoRow icon="fa-flag-checkered" label="Destino" value={cotizacion.destino} />
                    <InfoRow icon="fa-truck" label="Tipo de Unidad" 
                      value={cotizacion.tipoUnidad || 'No especificado'} />
                    <InfoRow icon="fa-clock" label="Tiempo Estimado" 
                      value={cotizacion.tiempoEstimado || 'No especificado'} />
                  </>
                ) : (
                  <div className="form-grid">
                    <FormField label="Origen *" name="origen" value={formData.origen} 
                      onChange={handleInputChange} placeholder="Ingrese origen" />
                    <FormField label="Destino *" name="destino" value={formData.destino} 
                      onChange={handleInputChange} placeholder="Ingrese destino" />
                    <FormField label="Tipo de Unidad" name="tipoUnidad" value={formData.tipoUnidad} 
                      onChange={handleInputChange} placeholder="Ej: Torton, 53ft" />
                    <FormField label="Tiempo Estimado" name="tiempoEstimado" value={formData.tiempoEstimado} 
                      onChange={handleInputChange} placeholder="Ej: 3-5 días" />
                    <FormField label="Costo (USD) *" name="costo" type="number" value={formData.costo} 
                      onChange={handleInputChange} step="0.01" />
                    <FormField label="Válido Hasta" name="validoHasta" type="date" value={formData.validoHasta} 
                      onChange={handleInputChange} />
                    <FormField label="Días de Crédito" name="diasCredito" type="number" 
                      value={formData.diasCredito} onChange={handleInputChange} />
                    <FormField label="Margen de Ganancia (%)" name="margenGananciaPct" type="number" 
                      value={formData.margenGananciaPct} onChange={handleInputChange} step="0.01" />
                  </div>
                )}
              </InfoCard>
            </div>

            {/* Sidebar derecha */}
            <div className="detalles-sidebar">
              {/* Información del proveedor */}
              <InfoCard title="Proveedor" icon="fa-truck">
                <InfoRow icon="fa-building" label="Nombre" 
                  value={cotizacion.proveedor?.nombre || 'N/A'} />
                <InfoRow icon="fa-envelope" label="Email" 
                  value={cotizacion.proveedor?.email || 'N/A'} />
                <InfoRow icon="fa-phone" label="Teléfono" 
                  value={cotizacion.proveedor?.telefono || 'N/A'} />
              </InfoCard>

              {/* Información financiera */}
              <InfoCard title="Información Financiera" icon="fa-dollar-sign">
                <InfoRow icon="fa-money-bill-wave" label="Costo" 
                  value={`$${cotizacion.costo?.toLocaleString('es-MX') || '0'}`} 
                  highlight={true} />
                <InfoRow icon="fa-percent" label="Margen" 
                  value={cotizacion.margenGananciaPct ? `${cotizacion.margenGananciaPct}%` : 'N/A'} />
                <InfoRow icon="fa-credit-card" label="Días de Crédito" 
                  value={`${cotizacion.diasCredito || 0} días`} />
              </InfoCard>
            </div>
          </div>

          {/* Acciones */}
          <div className="detalles-actions">
            {!modoEdicion ? (
              <>
                <ActionButton 
                  onClick={() => setModoEdicion(true)} 
                  icon="fa-edit" 
                  label="Editar" 
                />

                {/* Botón de Historial */ }
                <ActionButtonHistorial />
                
                {cotizacion.estado === 'PENDIENTE' && (
                  <ActionButton 
                    onClick={() => cambiarEstado('ENVIADO')} 
                    icon="fa-paper-plane" 
                    label="Marcar como Enviado" 
                    type="secondary"
                  />
                )}

                {cotizacion.estado === 'ENVIADO' && (
                  <ActionButton 
                    onClick={() => cambiarEstado('COMPLETADO')} 
                    icon="fa-check" 
                    label="Marcar como Completado" 
                    type="secondary"
                  />
                )}

                <ActionButton 
                  onClick={eliminar} 
                  icon="fa-trash" 
                  label="Eliminar" 
                  type="danger"
                />
              </>
            ) : (
              <>
                <ActionButton 
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
                  icon="fa-times" 
                  label="Cancelar" 
                  type="secondary"
                />
                <ActionButton 
                  onClick={guardarCambios} 
                  icon="fa-save" 
                  label="Guardar Cambios" 
                />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
      {/* Modal de Historial */}
      <HistorialModal
        isOpen={modalHistorial}
        onClose={() => setModalHistorial(false)}
        tipoEntidad="COTIZACION"
        entidadId={id}
        titulo={`Historial Completo - Cotización #${id}`}
      />
    </div>
  );
}