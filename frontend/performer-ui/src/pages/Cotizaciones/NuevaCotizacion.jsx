// src/pages/Cotizaciones/NuevaCotizacion.jsx - VERSIÓN OPTIMIZADA
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FormField from '../../components/FormField';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/cotizaciones.css';
import '../../styles/generales.css';

export default function NuevaCotizacion() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoTransporteActivo, setTipoTransporteActivo] = useState('TERRESTRE');
  
  const [formData, setFormData] = useState({
    solicitudId: '',
    proveedorId: '',
    tipoTransporte: 'TERRESTRE',
    origen: '',
    destino: '',
    tipoUnidad: '',
    tiempoEstimado: '',
    costo: '',
    validoHasta: '',
    diasCredito: '',
    margenGananciaPct: '',
    estado: 'PENDIENTE'
  });

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [resSol, resProv] = await Promise.all([
        api.get('/solicitudes'),
        api.get('/proveedores')
      ]);
      setSolicitudes(resSol.data);
      setProveedores(resProv.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos necesarios',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const cambiarTipoTransporte = (tipo) => {
    setTipoTransporteActivo(tipo);
    setFormData(prev => ({ ...prev, tipoTransporte: tipo }));
  };

  const crearCotizacion = async () => {
    const camposRequeridos = ['solicitudId', 'proveedorId', 'costo', 'origen', 'destino'];
    const faltanCampos = camposRequeridos.filter(campo => !formData[campo]);
    
    if (faltanCampos.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear cotización?',
      text: '¿Deseas crear esta nueva cotización?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        solicitud: { id: parseInt(formData.solicitudId) },
        proveedor: { id: parseInt(formData.proveedorId) },
        tipoTransporte: formData.tipoTransporte,
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

      await api.post('/cotizaciones', payload);
      
      await Swal.fire({
        icon: 'success',
        title: 'Cotización creada',
        text: 'La cotización fue creada correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/cotizaciones');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la cotización.',
      });
    }
  };

  // Componentes reutilizables internos
  const TransportTab = ({ tipo, icon, label }) => (
    <button
      className={`transport-tab ${tipoTransporteActivo === tipo ? 'active' : ''}`}
      onClick={() => cambiarTipoTransporte(tipo)}
    >
      <i className={`fa-solid ${icon}`}></i>
      {label}
    </button>
  );

  const ActionButton = ({ onClick, icon, label, type = 'primary', size = 'normal' }) => (
    <button className={`btn btn-${type} ${size === 'large' ? 'btn-large' : ''}`} onClick={onClick}>
      <i className={`fa-solid ${icon}`}></i>
      {label}
    </button>
  );

  const transportTabs = [
    { tipo: 'AEREO', icon: 'fa-plane', label: 'AÉREA' },
    { tipo: 'MARITIMO', icon: 'fa-ship', label: 'MARÍTIMA' },
    { tipo: 'TERRESTRE', icon: 'fa-truck', label: 'TERRESTRE' }
  ];

  const estadoOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'COMPLETADO', label: 'Completado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <main className="main-panel">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando...</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

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
            <h2 className="page-title-subheader">Nueva Cotización</h2>
          </div>
        </div>

        <main className="main-panel">
          {/* Pestañas de tipo de transporte */}
          <div className="transport-tabs">
            {transportTabs.map((tab) => (
              <TransportTab 
                key={tab.tipo}
                tipo={tab.tipo}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>

          {/* Formulario de cotización */}
          <div className="cotizacion-form-container">
            <div className="form-grid">
              {/* Solicitud */}
              <FormField
                type="select"
                label="Solicitud *"
                name="solicitudId"
                value={formData.solicitudId}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Seleccionar solicitud' },
                  ...solicitudes.map(s => ({
                    value: s.id,
                    label: `${s.folioCodigo} - ${s.cliente?.nombre || 'Sin cliente'}`
                  }))
                ]}
              />

              {/* Proveedor */}
              <FormField
                type="select"
                label="Proveedor *"
                name="proveedorId"
                value={formData.proveedorId}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Seleccionar proveedor' },
                  ...proveedores.map(p => ({
                    value: p.id,
                    label: p.nombre
                  }))
                ]}
              />

              {/* Tipo de Unidad */}
              <FormField
                type="text"
                label="Tipo de Unidad"
                name="tipoUnidad"
                value={formData.tipoUnidad}
                onChange={handleInputChange}
                placeholder="Ej: Trailer, Torton, Contenedor 40HQ"
              />

              {/* Tiempo Estimado */}
              <FormField
                type="text"
                label="Tiempo Estimado"
                name="tiempoEstimado"
                value={formData.tiempoEstimado}
                onChange={handleInputChange}
                placeholder="Ej: 3-5 días"
              />

              {/* Origen */}
              <FormField
                type="text"
                label="Origen *"
                name="origen"
                value={formData.origen}
                onChange={handleInputChange}
                placeholder="Ciudad de origen"
              />

              {/* Destino */}
              <FormField
                type="text"
                label="Destino *"
                name="destino"
                value={formData.destino}
                onChange={handleInputChange}
                placeholder="Ciudad de destino"
              />

              {/* Costo */}
              <FormField
                type="number"
                label="Costo (USD) *"
                name="costo"
                value={formData.costo}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
              />

              {/* Válido Hasta */}
              <FormField
                type="date"
                label="Válido Hasta"
                name="validoHasta"
                value={formData.validoHasta}
                onChange={handleInputChange}
              />

              {/* Días de Crédito */}
              <FormField
                type="number"
                label="Días de Crédito"
                name="diasCredito"
                value={formData.diasCredito}
                onChange={handleInputChange}
                placeholder="0"
              />

              {/* Margen de Ganancia */}
              <FormField
                type="number"
                label="Margen de Ganancia (%)"
                name="margenGananciaPct"
                value={formData.margenGananciaPct}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
              />

              {/* Estado */}
              <FormField
                type="select"
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                options={estadoOptions}
              />
            </div>

            <div className="modal-footer">
              <ActionButton
                onClick={() => navigate('/cotizaciones')}
                icon="fa-times"
                label="Cancelar"
                type="secondary"
              />
              <ActionButton
                onClick={crearCotizacion}
                icon="fa-plus"
                label="Crear Cotización"
                size="large"
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}