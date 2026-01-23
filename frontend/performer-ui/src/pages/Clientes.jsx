// src/pages/Clientes.jsx
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

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status] = useState('ok');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Usar el hook personalizado para el formulario
  const { values: formData, handleChange, resetForm } = useForm({
    nombre: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: '',
    codigoPostal: '',
    activo: true
  });

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/clientes/${id}`);
      setClientes(c => c.filter(x => x.id !== id));
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El cliente fue eliminado.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) { 
      console.log(err); 
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el cliente.',
      });
    }
  };

  const abrirModal = (cliente) => {
    setClienteSeleccionado(cliente);
    resetForm({
      nombre: cliente.nombre,
      rfc: cliente.rfc,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      pais: cliente.pais,
      codigoPostal: cliente.codigoPostal,
      activo: cliente.activo
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalNuevo(false);
    setClienteSeleccionado(null);
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
      await api.put(`/clientes/${clienteSeleccionado.id}`, formData);
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

  const crearCliente = async () => {
    if (!formData.nombre || !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa al menos el nombre y email',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear cliente?',
      text: `¿Deseas crear al cliente ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await api.post('/clientes', formData);
      await cargar();
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Cliente creado',
        text: 'El cliente fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el cliente.',
      });
    }
  };

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter(c => {
    const coincideBusqueda = 
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.rfc && c.rfc.toLowerCase().includes(busqueda.toLowerCase())) ||
      (c.ciudad && c.ciudad.toLowerCase().includes(busqueda.toLowerCase())) ||
      (c.telefono && c.telefono.includes(busqueda));
    
    const coincideFiltro = filtro === 'TODOS' || 
      (filtro === 'ACTIVOS' && c.activo) || 
      (filtro === 'INACTIVOS' && !c.activo);
    
    return coincideBusqueda && coincideFiltro;
  });

  // Contadores para las stats
  const contadores = {
    total: clientes.length,
    activos: clientes.filter(c => c.activo).length,
    inactivos: clientes.filter(c => !c.activo).length,
  };

  // Configuración de columnas para DataTable
  const columns = [
    {
      header: 'Cliente',
      render: (c) => (
        <div className="user-cell">
          <div className="user-avatar-small">
            {c.nombre.substring(0, 2).toUpperCase()}
          </div>
          <span className="user-name-text">{c.nombre}</span>
        </div>
      )
    },
    { 
      header: 'RFC', 
      render: (c) => c.rfc || 'N/A' 
    },
    { 
      header: 'Email', 
      render: (c) => c.email 
    },
    { 
      header: 'Teléfono', 
      render: (c) => c.telefono || 'N/A' 
    },
    { 
      header: 'Ciudad', 
      render: (c) => c.ciudad || 'N/A' 
    },
    {
      header: 'Estado',
      render: (c) => (
        <Badge type={c.activo ? 'activo' : 'inactivo'}>
          {c.activo ? 'ACTIVO' : 'INACTIVO'}
        </Badge>
      )
    }
  ];

  // Configuración de stats para StatsGrid
  const statsData = [
    {
      label: 'Total Clientes',
      value: contadores.total,
      icon: 'fa-building',
      iconClass: 'stat-icon-total'
    },
    {
      label: 'Activos',
      value: contadores.activos,
      icon: 'fa-circle-check',
      iconClass: 'stat-icon-activos'
    },
    {
      label: 'Inactivos',
      value: contadores.inactivos,
      icon: 'fa-circle-xmark',
      iconClass: 'stat-icon-inactivos'
    }
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
              <p>Cargando clientes...</p>
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
          titulo="Gestión de Clientes"
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODOS', label: 'Todos' },
            { valor: 'ACTIVOS', label: 'Activos' },
            { valor: 'INACTIVOS', label: 'Inactivos' }
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
            data={clientesFiltrados}
            columns={columns}
            renderActions={(cliente) => (
              <DropdownActions
                items={[
                  {
                    label: 'Ver Detalles',
                    icon: 'fa-eye',
                    onClick: () => abrirModal(cliente)
                  },
                  { divider: true },
                  {
                    label: 'Eliminar',
                    icon: 'fa-trash',
                    onClick: () => eliminar(cliente.id),
                    danger: true
                  }
                ]}
              />
            )}
            emptyMessage="No se encontraron clientes"
            emptyIcon="fa-building-slash"
          />
        </main>

        <Footer />
      </div>

      {/* Modal de Edición */}
      <Modal
        isOpen={modalAbierto && clienteSeleccionado}
        onClose={cerrarModal}
        title="Editar Cliente"
        large={true}
        footer={
          <>
            <button className="btn btn-danger" onClick={() => eliminar(clienteSeleccionado.id)}>
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
            {clienteSeleccionado?.nombre.substring(0, 2).toUpperCase()}
          </div>
          <h4>{clienteSeleccionado?.nombre}</h4>
          <p className="user-email">{clienteSeleccionado?.email}</p>
          <div className="user-badges">
            <Badge type={clienteSeleccionado?.activo ? 'activo' : 'inactivo'}>
              {clienteSeleccionado?.activo ? 'ACTIVO' : 'INACTIVO'}
            </Badge>
          </div>
        </div>

        {/* Formulario */}
        <FormField
          label="ID del Cliente"
          value={clienteSeleccionado?.id || ''}
          disabled={true}
        />

        <div className="form-grid">
          <FormField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ingrese el nombre"
          />
          <FormField
            label="RFC"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            placeholder="Ingrese el RFC"
          />
        </div>

        <div className="form-grid">
          <FormField
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Ingrese el email"
          />
          <FormField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ingrese el teléfono"
          />
        </div>

        <FormField
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección"
        />

        <div className="form-grid">
          <FormField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            placeholder="Ingrese la ciudad"
          />
          <FormField
            label="País"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            placeholder="Ingrese el país"
          />
          <FormField
            label="Código Postal"
            name="codigoPostal"
            value={formData.codigoPostal}
            onChange={handleChange}
            placeholder="CP"
          />
        </div>

        <FormField
          type="checkbox"
          label="Cliente Activo"
          name="activo"
          value={formData.activo}
          onChange={handleChange}
        />
      </Modal>

      {/* Modal de Nuevo Cliente */}
      <Modal
        isOpen={modalNuevo}
        onClose={cerrarModal}
        title="Nuevo Cliente"
        large={true}
        footer={
          <>
            <button className="btn btn-secondary" onClick={cerrarModal}>
              <i className="fa-solid fa-times"></i>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={crearCliente}>
              <i className="fa-solid fa-plus"></i>
              Crear
            </button>
          </>
        }
      >
        <div className="form-grid">
          <FormField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ingrese el nombre"
          />
          <FormField
            label="RFC"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            placeholder="Ingrese el RFC"
          />
        </div>

        <div className="form-grid">
          <FormField
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Ingrese el email"
          />
          <FormField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ingrese el teléfono"
          />
        </div>

        <FormField
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección"
        />

        <div className="form-grid">
          <FormField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            placeholder="Ingrese la ciudad"
          />
          <FormField
            label="País"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            placeholder="Ingrese el país"
          />
          <FormField
            label="Código Postal"
            name="codigoPostal"
            value={formData.codigoPostal}
            onChange={handleChange}
            placeholder="CP"
          />
        </div>

        <FormField
          type="checkbox"
          label="Cliente Activo"
          name="activo"
          value={formData.activo}
          onChange={handleChange}
        />
      </Modal>
    </div>
  );
}