// src/pages/Empleados.jsx - VERSIÓN OPTIMIZADA
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Subheader from '../components/Subheader';
import Footer from '../components/Footer';
import DataTable from '../components/DataTable';
import DropdownActions from '../components/DropdownActions';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import StatsGrid from '../components/StatsGrid';
import Badge from '../components/Badge';
import useForm from '../hooks/useForm';
import Swal from 'sweetalert2';
import '../styles/dashboard.css';
import '../styles/generales.css';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status] = useState('ok');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Usar el hook personalizado para el formulario
  const { values: formData, handleChange, resetForm } = useForm({
    nombre: '',
    email: '',
    passwordHash: '',
    rol: 'VENDEDOR',
    estado: 'ACTIVO'
  });

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/empleados');
      setEmpleados(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const aprobar = async (id) => {
    try {
      await api.post(`/empleados/${id}/aprobar`);
      setEmpleados(u => u.map(x => x.id === id ? { ...x, estado: 'ACTIVO' } : x));
      cerrarModal();
    } catch (err) { 
      console.log(err);
      setError('No se pudo aprobar empleado');
    }
  };

  const rechazar = async (id) => {
    try {
      await api.post(`/empleados/${id}/rechazar`);
      setEmpleados(u => u.map(x => x.id === id ? { ...x, estado: 'INACTIVO' } : x));
      cerrarModal();
    } catch (err) { 
      console.log(err); 
      setError('No se pudo rechazar empleado');
    }
  };

  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar empleado?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/empleados/${id}`);
      setEmpleados(u => u.filter(x => x.id !== id));
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El empleado fue eliminado.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) { 
      console.log(err); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el empleado.',
      });
    }
  };

  const abrirModal = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    resetForm({
      nombre: empleado.nombre,
      email: empleado.email,
      passwordHash: '',
      rol: empleado.rol,
      estado: empleado.estado
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalNuevo(false);
    setEmpleadoSeleccionado(null);
    resetForm();
  };

  const abrirModalNuevo = () => {
    resetForm();
    setModalNuevo(true);
  };

  const guardarCambios = async () => {
    const result = await Swal.fire({
      title: '¿Guardar cambios?',
      text: `¿Deseas guardar los cambios para ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        estado: formData.estado
      };
      
      if (formData.passwordHash) {
        payload.passwordHash = formData.passwordHash;
      }

      await api.put(`/empleados/${empleadoSeleccionado.id}`, payload);
      await cargar();
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Los cambios se guardaron correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los cambios.',
      });
    }
  };

  const crearEmpleado = async () => {
    if (!formData.nombre || !formData.email || !formData.passwordHash) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear empleado?',
      text: `¿Deseas crear al empleado ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await api.post('/empleados', formData);
      await cargar();
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Empleado creado',
        text: 'El empleado fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el empleado.',
      });
    }
  };

  // Filtrado de empleados
  const empleadosFiltrados = empleados.filter(u => {
    const coincideBusqueda = 
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideFiltro = filtro === 'TODOS' || u.estado === filtro;
    
    return coincideBusqueda && coincideFiltro;
  });

  // Contadores para las stats
  const contadores = {
    total: empleados.length,
    activos: empleados.filter(u => u.estado === 'ACTIVO').length,
    pendientes: empleados.filter(u => u.estado === 'PENDIENTE').length,
    inactivos: empleados.filter(u => u.estado === 'INACTIVO').length,
  };

  // Configuración de columnas para DataTable
  const columns = [
    {
      header: 'Empleado',
      render: (u) => (
        <div className="user-cell">
          <div className="user-avatar-small">
            {u.nombre.substring(0, 2).toUpperCase()}
          </div>
          <span className="user-name-text">{u.nombre}</span>
        </div>
      )
    },
    { 
      header: 'Email', 
      render: (u) => u.email 
    },
    {
      header: 'Rol',
      render: (u) => (
        <Badge type={u.rol.toLowerCase()}>
          {u.rol}
        </Badge>
      )
    },
    {
      header: 'Estado',
      render: (u) => (
        <Badge type={u.estado.toLowerCase()}>
          {u.estado}
        </Badge>
      )
    }
  ];

  // Configuración de stats para StatsGrid
  const statsData = [
    {
      label: 'Total Empleados',
      value: contadores.total,
      icon: 'fa-users',
      iconClass: 'stat-icon-total'
    },
    {
      label: 'Activos',
      value: contadores.activos,
      icon: 'fa-user-check',
      iconClass: 'stat-icon-activos'
    },
    {
      label: 'Pendientes',
      value: contadores.pendientes,
      icon: 'fa-clock',
      iconClass: 'stat-icon-pendientes'
    },
    {
      label: 'Inactivos',
      value: contadores.inactivos,
      icon: 'fa-user-slash',
      iconClass: 'stat-icon-inactivos'
    }
  ];

  // Obtener acciones dinámicas según el estado del empleado
  const getAccionesEmpleado = (empleado) => {
    const acciones = [
      {
        label: 'Ver Detalles',
        icon: 'fa-eye',
        onClick: () => abrirModal(empleado)
      }
    ];

    // Acciones según estado
    if (empleado.estado === 'PENDIENTE') {
      acciones.push({
        label: 'Aprobar',
        icon: 'fa-check',
        onClick: () => aprobar(empleado.id)
      });
    }

    if (empleado.estado === 'ACTIVO') {
      acciones.push({
        label: 'Desactivar',
        icon: 'fa-ban',
        onClick: () => rechazar(empleado.id)
      });
    }

    acciones.push({ divider: true });
    acciones.push({
      label: 'Eliminar',
      icon: 'fa-trash',
      onClick: () => eliminar(empleado.id),
      danger: true
    });

    return acciones;
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
              <p>Cargando empleados...</p>
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
        <Subheader
          titulo="Gestión de Empleados"
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODOS', label: 'Todos' },
            { valor: 'ACTIVO', label: 'Activos' },
            { valor: 'PENDIENTE', label: 'Pendientes' },
            { valor: 'INACTIVO', label: 'Inactivos' }
          ]}
          onAgregarClick={abrirModalNuevo}
        />

        <main className="main-panel">
          {/* Info Section */}
          <div className="info-section">
            <div className="info-item">
              <i className="fa-solid fa-calendar"></i>
              <span className="info-value">
                {new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="info-item">
              <div className={`status-indicator ${status !== 'ok' ? status : ''}`}></div>
              <span>Sistema:</span>
              <span className="info-value">
                {status === 'ok' ? 'Operacional' : status === 'loading' ? 'Conectando...' : 'Error'}
              </span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-clock"></i>
              <span>Última actualización:</span>
              <span className="info-value">
                {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid stats={statsData} />

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Data Table */}
          <DataTable
            data={empleadosFiltrados}
            columns={columns}
            renderActions={(empleado) => (
              <DropdownActions
                items={getAccionesEmpleado(empleado)}
              />
            )}
            emptyMessage="No se encontraron empleados"
            emptyIcon="fa-users-slash"
          />
        </main>

        <Footer />
      </div>

      {/* Modal de Edición */}
      <Modal
        isOpen={modalAbierto && empleadoSeleccionado}
        onClose={cerrarModal}
        title="Editar Empleado"
        footer={
          <>
            <button className="btn btn-danger" onClick={() => eliminar(empleadoSeleccionado.id)}>
              <i className="fa-solid fa-trash"></i>
              Eliminar
            </button>
            <button className="btn btn-secondary" onClick={cerrarModal}>
              <i className="fa-solid fa-times"></i>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={guardarCambios}>
              <i className="fa-solid fa-save"></i>
              Guardar
            </button>
          </>
        }
      >
        {/* User Details Card */}
        <div className="user-details-card">
          <div className="user-avatar-large">
            {empleadoSeleccionado?.nombre.substring(0, 2).toUpperCase()}
          </div>
          <h4>{empleadoSeleccionado?.nombre}</h4>
          <p className="user-email">{empleadoSeleccionado?.email}</p>
          <div className="user-badges">
            <Badge type={empleadoSeleccionado?.rol.toLowerCase()}>
              {empleadoSeleccionado?.rol}
            </Badge>
            <Badge type={empleadoSeleccionado?.estado.toLowerCase()}>
              {empleadoSeleccionado?.estado}
            </Badge>
          </div>
        </div>

        {/* Formulario */}
        <FormField
          label="ID del Empleado"
          value={empleadoSeleccionado?.id || ''}
          disabled={true}
        />

        <FormField
          label="Nombre Completo"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ingrese el nombre completo"
        />

        <FormField
          type="email"
          label="Correo Electrónico"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Ingrese el correo electrónico"
        />

        <FormField
          type="password"
          label="Nueva Contraseña (opcional)"
          name="passwordHash"
          value={formData.passwordHash}
          onChange={handleChange}
          placeholder="Dejar en blanco para mantener la actual"
        />

        <FormField
          type="select"
          label="Rol"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          options={[
            { value: 'VENDEDOR', label: 'VENDEDOR' },
            { value: 'PRICING', label: 'PRICING' },
            { value: 'ADMIN', label: 'ADMIN' }
          ]}
        />

        <FormField
          type="select"
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          options={[
            { value: 'ACTIVO', label: 'ACTIVO' },
            { value: 'INACTIVO', label: 'INACTIVO' },
            { value: 'PENDIENTE', label: 'PENDIENTE' }
          ]}
        />
      </Modal>

      {/* Modal de Nuevo Empleado */}
      <Modal
        isOpen={modalNuevo}
        onClose={cerrarModal}
        title="Nuevo Empleado"
        footer={
          <>
            <button className="btn btn-secondary" onClick={cerrarModal}>
              <i className="fa-solid fa-times"></i>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={crearEmpleado}>
              <i className="fa-solid fa-plus"></i>
              Crear
            </button>
          </>
        }
      >
        <FormField
          label="Nombre Completo"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ingrese el nombre completo"
        />

        <FormField
          type="email"
          label="Correo Electrónico"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Ingrese el correo electrónico"
        />

        <FormField
          type="password"
          label="Contraseña"
          name="passwordHash"
          value={formData.passwordHash}
          onChange={handleChange}
          required
          placeholder="Ingrese una contraseña"
        />

        <FormField
          type="select"
          label="Rol"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          options={[
            { value: 'VENDEDOR', label: 'VENDEDOR' },
            { value: 'PRICING', label: 'PRICING' },
            { value: 'ADMIN', label: 'ADMIN' }
          ]}
        />

        <FormField
          type="select"
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          options={[
            { value: 'ACTIVO', label: 'ACTIVO' },
            { value: 'INACTIVO', label: 'INACTIVO' },
            { value: 'PENDIENTE', label: 'PENDIENTE' }
          ]}
        />
      </Modal>
    </div>
  );
}