// src/pages/solicitudes/NuevaSolicitud.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/solicitudes.css';
import '../../styles/generales.css';

export default function NuevaSolicitud() {
  const navigate = useNavigate();
  const [pasoActual, setPasoActual] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  // Empresas disponibles
  const empresas = [
    { codigo: 'PER', nombre: 'Performer Logistics', icono: 'fa-ship' },
    { codigo: 'KLI', nombre: 'Kosmos Logistics', icono: 'fa-globe' },
    { codigo: 'GAM', nombre: 'Gamen', icono: 'fa-gamepad' },
    { codigo: 'LTR', nombre: 'LoopTrucking', icono: 'fa-truck' },
    { codigo: 'LOO', nombre: 'Looper', icono: 'fa-rotate' },
  ];

  const tiposServicio = [
    { valor: 'TERRESTRE', label: 'Terrestre' },
    { valor: 'MARITIMO', label: 'Marítimo' },
    { valor: 'AEREO', label: 'Aéreo' },
    { valor: 'MULTIMODAL', label: 'Multimodal' },
    { valor: 'EXCESO_DIMENSIONES', label: 'Exceso de Dimensiones' }
  ];

  const tiposEmpaque = [
    'Palet',
    'Caja',
    'Contenedor',
    'Bolsa',
    'Tambor',
    'Otro'
  ];

  const [formData, setFormData] = useState({
    empresaCodigo: '',
    clienteId: '',
    tipoServicio: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    origenPais: '',
    origenCiudad: '',
    origenDireccion: '',
    origenCp: '',
    destinoPais: '',
    destinoCiudad: '',
    destinoDireccion: '',
    destinoCp: '',
    cantidad: 1,
    largoCm: '',
    anchoCm: '',
    altoCm: '',
    pesoKg: '',
    apilable: false,
    valorDeclaradoUsd: '',
    tipoEmpaque: '',
    materialPeligroso: false,
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.filter(c => c.activo));
    } catch (err) {
      console.error('Error cargando clientes:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los clientes',
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

  const seleccionarEmpresa = (codigo) => {
    setFormData(prev => ({ ...prev, empresaCodigo: codigo }));
  };

  const validarPaso = () => {
    switch (pasoActual) {
      case 1:
        if (!formData.empresaCodigo) {
          Swal.fire({
            icon: 'warning',
            title: 'Seleccione una empresa',
            text: 'Debe seleccionar una empresa para continuar',
          });
          return false;
        }
        return true;

      case 2:
        if (!formData.clienteId || !formData.tipoServicio) {
          Swal.fire({
            icon: 'warning',
            title: 'Campos requeridos',
            text: 'Debe seleccionar un cliente y tipo de servicio',
          });
          return false;
        }
        return true;

      case 3:
        { const camposRequeridos = [
          'origenPais', 'origenCiudad', 'destinoPais', 'destinoCiudad'
        ];
        const faltantes = camposRequeridos.filter(campo => !formData[campo]);
        
        if (faltantes.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Campos requeridos',
            text: 'Debe completar país y ciudad de origen y destino',
          });
          return false;
        }
        return true; }

      case 4:
        if (!formData.cantidad || formData.cantidad < 1) {
          Swal.fire({
            icon: 'warning',
            title: 'Cantidad inválida',
            text: 'La cantidad debe ser al menos 1',
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const siguientePaso = () => {
    if (validarPaso()) {
      setPasoActual(prev => Math.min(prev + 1, 4));
    }
  };

  const pasoAnterior = () => {
    setPasoActual(prev => Math.max(prev - 1, 1));
  };

  const enviarSolicitud = async () => {
    if (!validarPaso()) return;

    const result = await Swal.fire({
      title: '¿Crear solicitud?',
      text: 'Se creará una nueva solicitud de servicio',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5b4cdb',
    });

    if (!result.isConfirmed) return;

    try {
      const solicitudData = {
        empresaCodigo: formData.empresaCodigo,
        fechaEmision: formData.fechaEmision,
        cliente: { id: parseInt(formData.clienteId) },
        tipoServicio: formData.tipoServicio,
        origenPais: formData.origenPais,
        origenCiudad: formData.origenCiudad,
        origenDireccion: formData.origenDireccion || null,
        origenCp: formData.origenCp || null,
        destinoPais: formData.destinoPais,
        destinoCiudad: formData.destinoCiudad,
        destinoDireccion: formData.destinoDireccion || null,
        destinoCp: formData.destinoCp || null,
        cantidad: parseInt(formData.cantidad),
        largoCm: formData.largoCm ? parseFloat(formData.largoCm) : null,
        anchoCm: formData.anchoCm ? parseFloat(formData.anchoCm) : null,
        altoCm: formData.altoCm ? parseFloat(formData.altoCm) : null,
        pesoKg: formData.pesoKg ? parseFloat(formData.pesoKg) : null,
        apilable: formData.apilable,
        valorDeclaradoUsd: formData.valorDeclaradoUsd ? parseFloat(formData.valorDeclaradoUsd) : null,
        tipoEmpaque: formData.tipoEmpaque || null,
        materialPeligroso: formData.materialPeligroso,
      };

      console.log('Enviando solicitud:', solicitudData);

      await api.post('/solicitudes', solicitudData);

      await Swal.fire({
        icon: 'success',
        title: '¡Solicitud creada!',
        text: 'La solicitud se creó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/solicitudes/mis-solicitudes');
    } catch (err) {
      console.error('Error creando solicitud:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo crear la solicitud. Por favor intente nuevamente.',
      });
    }
  };

  const renderPaso1 = () => (
    <div className="form-step-container">
      <h2 className="form-step-title">Seleccione la Empresa</h2>
      <p className="form-step-subtitle">
        Elija la empresa desde la cual se generará la solicitud
      </p>

      <div className="empresa-grid">
        {empresas.map(empresa => (
          <div
            key={empresa.codigo}
            className={`empresa-card ${formData.empresaCodigo === empresa.codigo ? 'selected' : ''}`}
            onClick={() => seleccionarEmpresa(empresa.codigo)}
          >
            <div className="empresa-icon">
              <i className={`fa-solid ${empresa.icono}`}></i>
            </div>
            <div className="empresa-name">{empresa.nombre}</div>
            <div className="empresa-code">{empresa.codigo}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaso2 = () => (
    <div className="form-step-container">
      <h2 className="form-step-title">Información General</h2>
      <p className="form-step-subtitle">
        Complete los datos básicos de la solicitud
      </p>

      <div className="form-section">
        <label className="required-field">Folio</label>
        <input
          type="text"
          value={`${formData.empresaCodigo}-XXXXX-${new Date().getFullYear()}`}
          disabled
          className="form-input"
          placeholder="Se generará automáticamente"
        />
      </div>

      <div className="form-grid-2">
        <div className="form-section">
          <label className="required-field">Cliente</label>
          <select
            name="clienteId"
            value={formData.clienteId}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">-- Seleccione un cliente --</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="required-field">Tipo de Servicio</label>
          <select
            name="tipoServicio"
            value={formData.tipoServicio}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">-- Seleccione tipo de servicio --</option>
            {tiposServicio.map(tipo => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label className="required-field">Fecha de Emisión</label>
        <input
          type="date"
          name="fechaEmision"
          value={formData.fechaEmision}
          onChange={handleInputChange}
          className="form-input"
        />
      </div>
    </div>
  );

  const renderPaso3 = () => (
    <div className="form-step-container">
      <h2 className="form-step-title">Origen y Destino</h2>
      <p className="form-step-subtitle">
        Especifique las ubicaciones de origen y destino
      </p>

      <div className="origen-destino-container">
        {/* ORIGEN */}
        <div className="location-panel">
          <h3 className="location-title">
            <i className="fa-solid fa-location-dot"></i> ORIGEN
          </h3>

          <div className="form-section">
            <label className="required-field">País</label>
            <input
              type="text"
              name="origenPais"
              value={formData.origenPais}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: México"
            />
          </div>

          <div className="form-section">
            <label className="required-field">Ciudad</label>
            <input
              type="text"
              name="origenCiudad"
              value={formData.origenCiudad}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Torreón"
            />
          </div>

          <div className="form-section">
            <label>Dirección</label>
            <textarea
              name="origenDireccion"
              value={formData.origenDireccion}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Dirección completa (opcional)"
            />
          </div>

          <div className="form-section">
            <label>Código Postal</label>
            <input
              type="text"
              name="origenCp"
              value={formData.origenCp}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: 27000"
            />
          </div>
        </div>

        {/* DESTINO */}
        <div className="location-panel">
          <h3 className="location-title">
            <i className="fa-solid fa-flag-checkered"></i> DESTINO
          </h3>

          <div className="form-section">
            <label className="required-field">País</label>
            <input
              type="text"
              name="destinoPais"
              value={formData.destinoPais}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Estados Unidos"
            />
          </div>

          <div className="form-section">
            <label className="required-field">Ciudad</label>
            <input
              type="text"
              name="destinoCiudad"
              value={formData.destinoCiudad}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Houston"
            />
          </div>

          <div className="form-section">
            <label>Dirección</label>
            <textarea
              name="destinoDireccion"
              value={formData.destinoDireccion}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Dirección completa (opcional)"
            />
          </div>

          <div className="form-section">
            <label>Código Postal</label>
            <input
              type="text"
              name="destinoCp"
              value={formData.destinoCp}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: 77001"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaso4 = () => (
    <div className="form-step-container">
      <h2 className="form-step-title">Detalles del Embarque</h2>
      <p className="form-step-subtitle">
        Especifique las características de la carga
      </p>

      <div className="form-grid">
        <div className="form-section">
          <label className="required-field">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleInputChange}
            className="form-input"
            min="1"
            placeholder="1"
          />
        </div>

        <div className="form-section">
          <label>Tipo de Empaque</label>
          <select
            name="tipoEmpaque"
            value={formData.tipoEmpaque}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">-- Seleccione --</option>
            {tiposEmpaque.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label>Dimensiones (largo × ancho × alto) en centímetros</label>
        <div className="form-grid">
          <input
            type="number"
            name="largoCm"
            value={formData.largoCm}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Largo (cm)"
            step="0.01"
          />
          <input
            type="number"
            name="anchoCm"
            value={formData.anchoCm}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Ancho (cm)"
            step="0.01"
          />
          <input
            type="number"
            name="altoCm"
            value={formData.altoCm}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Alto (cm)"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-section">
          <label>Peso (kg)</label>
          <input
            type="number"
            name="pesoKg"
            value={formData.pesoKg}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Peso en kilogramos"
            step="0.01"
          />
        </div>

        <div className="form-section">
          <label>Valor Declarado (USD)</label>
          <input
            type="number"
            name="valorDeclaradoUsd"
            value={formData.valorDeclaradoUsd}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Valor en dólares"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-section">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="apilable"
              name="apilable"
              checked={formData.apilable}
              onChange={handleInputChange}
              className="checkbox-input"
            />
            <label htmlFor="apilable" className="checkbox-label-text">
              <i className="fa-solid fa-layer-group"></i> ¿Es apilable?
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="materialPeligroso"
              name="materialPeligroso"
              checked={formData.materialPeligroso}
              onChange={handleInputChange}
              className="checkbox-input"
            />
            <label htmlFor="materialPeligroso" className="checkbox-label-text">
              <i className="fa-solid fa-triangle-exclamation"></i> ¿Material peligroso?
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader titulo="Nueva Solicitud" />
          <main className="main-panel">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando formulario...</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  const pasos = [
    { numero: 1, label: 'Empresa', icono: 'fa-building' },
    { numero: 2, label: 'Información', icono: 'fa-file-lines' },
    { numero: 3, label: 'Ubicaciones', icono: 'fa-map-location-dot' },
    { numero: 4, label: 'Embarque', icono: 'fa-box' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar rol={rol} />
      
      <div className="dashboard-content">
        <Header nombre={nombre} rol={rol} />
        <Subheader titulo="Nueva Solicitud" />
        
        <main className="main-panel">
          {/* Info Section */}
          <div className="info-section">
            <div className="info-item">
              <i className="fa-solid fa-clipboard-list"></i>
              <span>Paso:</span>
              <span className="info-value">{pasoActual} de 4</span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-building"></i>
              <span>Empresa:</span>
              <span className="info-value">
                {formData.empresaCodigo || 'No seleccionada'}
              </span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-calendar"></i>
              <span>Fecha:</span>
              <span className="info-value">
                {new Date().toLocaleDateString('es-MX')}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="stepper-container">
            <div className="stepper">
              {pasos.map((paso) => (
                <div 
                  key={paso.numero}
                  className={`step ${pasoActual >= paso.numero ? 'active' : ''} ${pasoActual > paso.numero ? 'completed' : ''}`}
                >
                  <div className="step-circle">
                    {pasoActual > paso.numero ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className={`fa-solid ${paso.icono}`}></i>
                    )}
                  </div>
                  <div className="step-label">{paso.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contenido del paso actual */}
          {pasoActual === 1 && renderPaso1()}
          {pasoActual === 2 && renderPaso2()}
          {pasoActual === 3 && renderPaso3()}
          {pasoActual === 4 && renderPaso4()}

          {/* Navegación */}
          <div className="form-navigation">
            <button
              className="btn btn-secondary"
              onClick={pasoAnterior}
              disabled={pasoActual === 1}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Anterior
            </button>

            {pasoActual < 4 ? (
              <button
                className="btn btn-primary"
                onClick={siguientePaso}
              >
                Siguiente
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={enviarSolicitud}
              >
                <i className="fa-solid fa-check"></i>
                Crear Solicitud
              </button>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}