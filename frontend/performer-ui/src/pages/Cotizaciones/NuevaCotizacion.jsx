// src/pages/Cotizaciones/NuevaCotizacion.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/cotizaciones.css';

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

  useEffect(() => {
    cargarDatos();
  }, []);

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
    if (!formData.solicitudId || !formData.proveedorId || !formData.costo || !formData.origen || !formData.destino) {
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
            <button 
              className="btn-back"
              onClick={() => navigate('/cotizaciones')}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver
            </button>
            <h2 className="page-title-subheader">Nueva Cotización</h2>
          </div>
        </div>

        <main className="main-panel">
          {/* Pestañas de tipo de transporte */}
          <div className="transport-tabs">
            <button
              className={`transport-tab ${tipoTransporteActivo === 'AEREO' ? 'active' : ''}`}
              onClick={() => cambiarTipoTransporte('AEREO')}
            >
              <i className="fa-solid fa-plane"></i>
              AÉREA
            </button>
            <button
              className={`transport-tab ${tipoTransporteActivo === 'MARITIMO' ? 'active' : ''}`}
              onClick={() => cambiarTipoTransporte('MARITIMO')}
            >
              <i className="fa-solid fa-ship"></i>
              MARÍTIMA
            </button>
            <button
              className={`transport-tab ${tipoTransporteActivo === 'TERRESTRE' ? 'active' : ''}`}
              onClick={() => cambiarTipoTransporte('TERRESTRE')}
            >
              <i className="fa-solid fa-truck"></i>
              TERRESTRE
            </button>
          </div>

          {/* Formulario de cotización */}
          <div className="cotizacion-form-container">
            <div className="form-grid">
              <div className="form-section">
                <label>Solicitud *</label>
                <select 
                  name="solicitudId"
                  value={formData.solicitudId}
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="">Seleccionar solicitud</option>
                  {solicitudes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.folioCodigo} - {s.cliente?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label>Proveedor *</label>
                <select 
                  name="proveedorId"
                  value={formData.proveedorId}
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label>Tipo de Unidad</label>
                <input 
                  type="text" 
                  name="tipoUnidad"
                  value={formData.tipoUnidad}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ej: Trailer, Torton, Contenedor 40HQ"
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
                  placeholder="Ej: 3-5 días"
                />
              </div>

              <div className="form-section">
                <label>Origen *</label>
                <input 
                  type="text" 
                  name="origen"
                  value={formData.origen}
                  onChange={handleInputChange}
                  className="select-input"
                  placeholder="Ciudad de origen"
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
                  placeholder="Ciudad de destino"
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
                  placeholder="0.00"
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
                  placeholder="0"
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
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="form-section">
                <label>Estado</label>
                <select 
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="select-input"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/cotizaciones')}
              >
                <i className="fa-solid fa-times"></i>
                Cancelar
              </button>
              <button 
                className="btn btn-primary btn-large"
                onClick={crearCotizacion}
              >
                <i className="fa-solid fa-plus"></i>
                Crear Cotización
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}