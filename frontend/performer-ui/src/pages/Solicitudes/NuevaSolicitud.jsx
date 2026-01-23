// src/pages/solicitudes/NuevaSolicitud.jsx - VERSIÓN OPTIMIZADA
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import FormField from '../../components/FormField';
import Badge from '../../components/Badge';
import Swal from 'sweetalert2';
import useForm from '../../hooks/useForm';
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
    { valor: 'Palet', label: 'Palet' },
    { valor: 'Caja', label: 'Caja' },
    { valor: 'Contenedor', label: 'Contenedor' },
    { valor: 'Bolsa', label: 'Bolsa' },
    { valor: 'Tambor', label: 'Tambor' },
    { valor: 'Otro', label: 'Otro' }
  ];

  // Usar hook useForm para manejo del formulario
  const { values: formData, handleChange, setFieldValue } = useForm({
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

  const seleccionarEmpresa = (codigo) => {
    setFieldValue('empresaCodigo', codigo);
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

      <FormField
        label="Folio"
        value={`${formData.empresaCodigo || '---'}-XXXXX-${new Date().getFullYear()}`}
        disabled={true}
        placeholder="Se generará automáticamente"
      />

      <div className="form-grid-2">
        <FormField
          type="select"
          label="Cliente"
          name="clienteId"
          value={formData.clienteId}
          onChange={handleChange}
          required={true}
          options={[
            { value: '', label: '-- Seleccione un cliente --' },
            ...clientes.map(cliente => ({
              value: cliente.id,
              label: cliente.nombre
            }))
          ]}
        />

        <FormField
          type="select"
          label="Tipo de Servicio"
          name="tipoServicio"
          value={formData.tipoServicio}
          onChange={handleChange}
          required={true}
          options={[
            { value: '', label: '-- Seleccione tipo de servicio --' },
            ...tiposServicio.map(tipo => ({
              value: tipo.valor,
              label: tipo.label
            }))
          ]}
        />
      </div>

      <FormField
        type="date"
        label="Fecha de Emisión"
        name="fechaEmision"
        value={formData.fechaEmision}
        onChange={handleChange}
        required={true}
      />
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

          <FormField
            label="País"
            name="origenPais"
            value={formData.origenPais}
            onChange={handleChange}
            placeholder="Ej: México"
            required={true}
          />

          <FormField
            label="Ciudad"
            name="origenCiudad"
            value={formData.origenCiudad}
            onChange={handleChange}
            placeholder="Ej: Torreón"
            required={true}
          />

          <FormField
            type="textarea"
            label="Dirección"
            name="origenDireccion"
            value={formData.origenDireccion}
            onChange={handleChange}
            placeholder="Dirección completa (opcional)"
          />

          <FormField
            label="Código Postal"
            name="origenCp"
            value={formData.origenCp}
            onChange={handleChange}
            placeholder="Ej: 27000"
          />
        </div>

        {/* DESTINO */}
        <div className="location-panel">
          <h3 className="location-title">
            <i className="fa-solid fa-flag-checkered"></i> DESTINO
          </h3>

          <FormField
            label="País"
            name="destinoPais"
            value={formData.destinoPais}
            onChange={handleChange}
            placeholder="Ej: Estados Unidos"
            required={true}
          />

          <FormField
            label="Ciudad"
            name="destinoCiudad"
            value={formData.destinoCiudad}
            onChange={handleChange}
            placeholder="Ej: Houston"
            required={true}
          />

          <FormField
            type="textarea"
            label="Dirección"
            name="destinoDireccion"
            value={formData.destinoDireccion}
            onChange={handleChange}
            placeholder="Dirección completa (opcional)"
          />

          <FormField
            label="Código Postal"
            name="destinoCp"
            value={formData.destinoCp}
            onChange={handleChange}
            placeholder="Ej: 77001"
          />
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

      <div className="form-grid-2">
        <FormField
          type="number"
          label="Cantidad"
          name="cantidad"
          value={formData.cantidad}
          onChange={handleChange}
          required={true}
          min="1"
          placeholder="1"
        />

        <FormField
          type="select"
          label="Tipo de Empaque"
          name="tipoEmpaque"
          value={formData.tipoEmpaque}
          onChange={handleChange}
          options={[
            { value: '', label: '-- Seleccione --' },
            ...tiposEmpaque
          ]}
        />
      </div>

      <div className="form-section">
        <label className="required-field">Dimensiones (largo × ancho × alto) en centímetros</label>
        <div className="form-grid">
          <FormField
            type="number"
            label=""
            name="largoCm"
            value={formData.largoCm}
            onChange={handleChange}
            placeholder="Largo (cm)"
            step="0.01"
          />
          <FormField
            type="number"
            label=""
            name="anchoCm"
            value={formData.anchoCm}
            onChange={handleChange}
            placeholder="Ancho (cm)"
            step="0.01"
          />
          <FormField
            type="number"
            label=""
            name="altoCm"
            value={formData.altoCm}
            onChange={handleChange}
            placeholder="Alto (cm)"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-grid-2">
        <FormField
          type="number"
          label="Peso (kg)"
          name="pesoKg"
          value={formData.pesoKg}
          onChange={handleChange}
          placeholder="Peso en kilogramos"
          step="0.01"
        />

        <FormField
          type="number"
          label="Valor Declarado (USD)"
          name="valorDeclaradoUsd"
          value={formData.valorDeclaradoUsd}
          onChange={handleChange}
          placeholder="Valor en dólares"
          step="0.01"
        />
      </div>

      <div className="form-grid-2">
        <FormField
          type="checkbox"
          label={
            <span className="checkbox-with-icon">
              <i className="fa-solid fa-layer-group"></i>
              <span>¿Es apilable?</span>
            </span>
          }
          name="apilable"
          value={formData.apilable}
          onChange={handleChange}
        />

        <FormField
          type="checkbox"
          label={
            <span className="checkbox-with-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>¿Material peligroso?</span>
            </span>
          }
          name="materialPeligroso"
          value={formData.materialPeligroso}
          onChange={handleChange}
        />
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
              <span className="info-value">
                {pasoActual} de 4
                <Badge type={pasoActual === 4 ? 'completado' : 'pendiente'} style={{ marginLeft: '10px' }}>
                  {pasoActual === 4 ? 'Listo' : 'En progreso'}
                </Badge>
              </span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-building"></i>
              <span>Empresa:</span>
              <span className="info-value">
                {formData.empresaCodigo 
                  ? empresas.find(e => e.codigo === formData.empresaCodigo)?.nombre
                  : 'No seleccionada'}
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