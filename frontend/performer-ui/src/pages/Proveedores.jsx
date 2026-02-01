// src/pages/Proveedores.jsx
import { useEffect, useState, useMemo } from 'react';
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
import Paginacion from '../components/Paginacion';
import useForm from '../hooks/useForm';
import Swal from 'sweetalert2';
import '../styles/dashboard.css';
import '../styles/generales.css';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status] = useState('ok');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(5);

  // Usar el hook personalizado para el formulario
  const { values: formData, handleChange, resetForm } = useForm({
    nombre: '',
    email: '',
    telefono: '',
    pais: '',
    ciudad: '',
    activo: true
  });

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  // Permisos según rol - AGREGADO
  const permisos = useMemo(() => ({
    puedeCrear: rol === 'VENDEDOR' || rol === 'PRICING', // Solo VENDEDOR y PRICING pueden crear
    puedeEditar: rol === 'VENDEDOR' || rol === 'PRICING', // Solo VENDEDOR y PRICING pueden editar
    puedeEliminar: rol === 'ADMIN', // Solo ADMIN puede eliminar (según controller)
    puedeVerTodo: true, // Todos pueden ver
    esVendedor: rol === 'VENDEDOR',
    esPricing: rol === 'PRICING',
    esAdmin: rol === 'ADMIN'
  }), [rol]);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/proveedores');
      setProveedores(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    // Verificar permisos - AGREGADO
    if (!permisos.puedeEliminar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para eliminar proveedores.',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/proveedores/${id}`);
      setProveedores(p => p.filter(x => x.id !== id));
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El proveedor fue eliminado.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el proveedor.',
      });
    }
  };

  const abrirModal = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    resetForm({
      nombre: proveedor.nombre,
      email: proveedor.email,
      telefono: proveedor.telefono,
      pais: proveedor.pais,
      ciudad: proveedor.ciudad,
      activo: proveedor.activo
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalNuevo(false);
    setProveedorSeleccionado(null);
    resetForm();
  };

  const abrirModalNuevo = () => {
    // Verificar permisos - AGREGADO
    if (!permisos.puedeCrear) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para crear nuevos proveedores.',
      });
      return;
    }
    
    resetForm();
    setModalNuevo(true);
  };

  const guardarCambios = async () => {
    // Verificar permisos - AGREGADO
    if (!permisos.puedeEditar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para editar proveedores.',
      });
      return;
    }

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
      await api.put(`/proveedores/${proveedorSeleccionado.id}`, formData);
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

  const crearProveedor = async () => {
    // Verificar permisos - AGREGADO
    if (!permisos.puedeCrear) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para crear proveedores.',
      });
      return;
    }

    if (!formData.nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa al menos el nombre',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear proveedor?',
      text: `¿Deseas crear al proveedor ${formData.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await api.post('/proveedores', formData);
      await cargar();
      cerrarModal();
      Swal.fire({
        icon: 'success',
        title: 'Proveedor creado',
        text: 'El proveedor fue creado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el proveedor.',
      });
    }
  };

  // Filtrado de proveedores con useMemo para optimización
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter(p => {
      const coincideBusqueda =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.pais && p.pais.toLowerCase().includes(busqueda.toLowerCase())) ||
        (p.ciudad && p.ciudad.toLowerCase().includes(busqueda.toLowerCase()));
      
      const coincideFiltro = filtro === 'TODOS' ||
        (filtro === 'ACTIVOS' && p.activo) ||
        (filtro === 'INACTIVOS' && !p.activo);
      
      return coincideBusqueda && coincideFiltro;
    });
  }, [proveedores, filtro, busqueda]);

  // Calcular proveedores paginados
  const proveedoresPaginados = useMemo(() => {
    const startIndex = (paginaActual - 1) * elementosPorPagina;
    const endIndex = startIndex + elementosPorPagina;
    return proveedoresFiltrados.slice(startIndex, endIndex);
  }, [proveedoresFiltrados, paginaActual, elementosPorPagina]);

  // Contadores para las stats con useMemo
  const statsData = useMemo(() => {
    const contadores = {
      total: proveedores.length,
      activos: proveedores.filter(p => p.activo).length,
      inactivos: proveedores.filter(p => !p.activo).length,
    };

    return [
      {
        label: 'Total Proveedores',
        value: contadores.total,
        icon: 'fa-truck',
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
  }, [proveedores]);

  // Configuración de columnas para DataTable
  const columns = [
    {
      header: 'Proveedor',
      render: (p) => (
        <div className="user-cell">
          <div className="user-avatar-small">
            {p.nombre.substring(0, 2).toUpperCase()}
          </div>
          <span className="user-name-text">{p.nombre}</span>
        </div>
      )
    },
    { 
      header: 'Email', 
      render: (p) => p.email || 'N/A' 
    },
    { 
      header: 'Teléfono', 
      render: (p) => p.telefono || 'N/A' 
    },
    { 
      header: 'País', 
      render: (p) => p.pais || 'N/A' 
    },
    { 
      header: 'Ciudad', 
      render: (p) => p.ciudad || 'N/A' 
    },
    {
      header: 'Estado',
      render: (p) => (
        <Badge type={p.activo ? 'activo' : 'inactivo'}>
          {p.activo ? 'ACTIVO' : 'INACTIVO'}
        </Badge>
      )
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader titulo="Gestión de Proveedores" />
          <main className="main-panel">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando proveedores...</p>
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
          titulo="Gestión de Proveedores"
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODOS', label: 'Todos' },
            { valor: 'ACTIVOS', label: 'Activos' },
            { valor: 'INACTIVOS', label: 'Inactivos' }
          ]}
          // Solo VENDEDOR y PRICING pueden agregar nuevos proveedores - MODIFICADO
          onAgregarClick={permisos.puedeCrear ? abrirModalNuevo : undefined}
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

          {/* Controles de paginación (superior) */}
          {proveedoresFiltrados.length > 0 && (
            <Paginacion
              paginaActual={paginaActual}
              totalElementos={proveedoresFiltrados.length}
              elementosPorPagina={elementosPorPagina}
              onChangePagina={setPaginaActual}
            />
          )}

          {/* Data Table con acciones condicionales - MODIFICADO */}
          <DataTable
            data={proveedoresPaginados}
            columns={columns}
            renderActions={(proveedor) => (
              <DropdownActions
                items={[
                  {
                    label: 'Ver Detalles',
                    icon: 'fa-eye',
                    onClick: () => abrirModal(proveedor)
                  },
                  // Solo mostrar opción de eliminar si el usuario tiene permisos - AGREGADO
                  ...(permisos.puedeEliminar ? [{ divider: true }] : []),
                  ...(permisos.puedeEliminar ? [{
                    label: 'Eliminar',
                    icon: 'fa-trash',
                    onClick: () => eliminar(proveedor.id),
                    danger: true
                  }] : [])
                ]}
              />
            )}
            emptyMessage="No se encontraron proveedores"
            emptyIcon="fa-truck-slash"
          />

          {/* Controles de paginación (inferior) */}
          {proveedoresFiltrados.length > 0 && (
            <Paginacion
              paginaActual={paginaActual}
              totalElementos={proveedoresFiltrados.length}
              elementosPorPagina={elementosPorPagina}
              onChangePagina={setPaginaActual}
            />
          )}
        </main>

        <Footer />
      </div>

      {/* Modal de Edición con botones condicionales - MODIFICADO */}
      <Modal
        isOpen={modalAbierto && proveedorSeleccionado}
        onClose={cerrarModal}
        title="Editar Proveedor"
        large={true}
        footer={
          <>
            {/* Solo ADMIN ve botón Eliminar - AGREGADO */}
            {permisos.puedeEliminar && (
              <button className="btn btn-danger" onClick={() => eliminar(proveedorSeleccionado.id)}>
                <i className="fa-solid fa-trash"></i>
                Eliminar
              </button>
            )}
            <button className="btn btn-secondary" onClick={cerrarModal}>
              <i className="fa-solid fa-times"></i>
              Cancelar
            </button>
            {/* Solo VENDEDOR y PRICING ven botón Guardar - AGREGADO */}
            {permisos.puedeEditar && (
              <button className="btn btn-primary" onClick={guardarCambios}>
                <i className="fa-solid fa-save"></i>
                Guardar
              </button>
            )}
          </>
        }
      >
        {/* User Details Card */}
        <div className="user-details-card">
          <div className="user-avatar-large">
            {proveedorSeleccionado?.nombre.substring(0, 2).toUpperCase()}
          </div>
          <h4>{proveedorSeleccionado?.nombre}</h4>
          <p className="user-email">{proveedorSeleccionado?.email || 'Sin email'}</p>
          <div className="user-badges">
            <Badge type={proveedorSeleccionado?.activo ? 'activo' : 'inactivo'}>
              {proveedorSeleccionado?.activo ? 'ACTIVO' : 'INACTIVO'}
            </Badge>
          </div>
        </div>

        {/* Formulario */}
        <FormField
          label="ID del Proveedor"
          value={proveedorSeleccionado?.id || ''}
          disabled={true}
        />

        <FormField
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ingrese el nombre"
        />

        <div className="form-grid">
          <FormField
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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

        <div className="form-grid">
          <FormField
            label="País"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            placeholder="Ingrese el país"
          />

          <FormField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            placeholder="Ingrese la ciudad"
          />
        </div>

        <FormField
          type="checkbox"
          label="Proveedor Activo"
          name="activo"
          value={formData.activo}
          onChange={handleChange}
        />
      </Modal>

      {/* Modal de Nuevo Proveedor con botones condicionales - MODIFICADO */}
      <Modal
        isOpen={modalNuevo}
        onClose={cerrarModal}
        title="Nuevo Proveedor"
        large={true}
        footer={
          <>
            <button className="btn btn-secondary" onClick={cerrarModal}>
              <i className="fa-solid fa-times"></i>
              Cancelar
            </button>
            {/* Solo VENDEDOR y PRICING ven botón Crear - AGREGADO */}
            {permisos.puedeCrear && (
              <button className="btn btn-primary" onClick={crearProveedor}>
                <i className="fa-solid fa-plus"></i>
                Crear
              </button>
            )}
          </>
        }
      >
        <FormField
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ingrese el nombre"
        />

        <div className="form-grid">
          <FormField
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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

        <div className="form-grid">
          <FormField
            label="País"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            placeholder="Ingrese el país"
          />

          <FormField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            placeholder="Ingrese la ciudad"
          />
        </div>

        <FormField
          type="checkbox"
          label="Proveedor Activo"
          name="activo"
          value={formData.activo}
          onChange={handleChange}
        />
      </Modal>
    </div>
  );
}