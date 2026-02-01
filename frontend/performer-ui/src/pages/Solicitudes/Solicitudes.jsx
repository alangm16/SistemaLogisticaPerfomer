// src/pages/solicitudes/Solicitudes.jsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import DataTable from '../../components/DataTable';
import DropdownActions from '../../components/DropdownActions';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import StatsGrid from '../../components/StatsGrid';
import Badge from '../../components/Badge';
import HistorialModal from '../../components/HistorialModal';
import Paginacion from '../../components/Paginacion'; // Importar componente
import useForm from '../../hooks/useForm';
import useWorkflow from '../../hooks/useWorkflow';
import Swal from 'sweetalert2';
import authHeader from '../../services/authHeader';
import '../../styles/dashboard.css';
import '../../styles/solicitudes.css';
import '../../styles/generales.css';

export default function Solicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('TODAS');
  const [filtroFecha, setFiltroFecha] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [entidadHistorial, setEntidadHistorial] = useState({tipo: '', id:null});

  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(5);

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  // Permisos según rol - AGREGADO
  const permisos = {
    puedeAsignar: rol === 'PRICING', // Solo PRICING y ADMIN pueden asignar
    puedeCambiarEstado: rol === 'PRICING', // Solo PRICING y ADMIN pueden cambiar estados
    puedeCrear: rol === 'VENDEDOR', // Solo VENDEDOR puede crear nuevas solicitudes
    puedeVerHistorial: true, // Todos pueden ver historial
    puedeVerDetalles: true, // Todos pueden ver detalles
    puedeVerTodo: rol === 'PRICING' || rol === 'ADMIN', // PRICING y ADMIN ven todas las solicitudes
    esVendedor: rol === 'VENDEDOR', // Para lógica específica de vendedor
    esPricing: rol === 'PRICING', // Para lógica específica de pricing
    esAdmin: rol === 'ADMIN' // Para lógica específica de admin
  };

  // Hook personalizado para el formulario de asignación
  const { values: formAsignacion, handleChange: handleAsignacionChange, resetForm: resetAsignacion } = useForm({
    empleadoId: ''
  });

  const { validarTransicion } = useWorkflow();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      let endpoint = '/solicitudes';
      
      // VENDEDOR solo ve sus propias solicitudes y asignadas
      if (rol === 'VENDEDOR') {
        endpoint = '/solicitudes/mis';
      } 
      // PRICING y ADMIN ven todas
      else if (rol === 'PRICING' || rol === 'ADMIN') {
        endpoint = '/solicitudes';
      }
      
      const [resSolicitudes, resEmpleados] = await Promise.all([
        api.get(endpoint, { headers: authHeader() }),
        rol === 'PRICING' || rol === 'ADMIN' 
          ? api.get('/empleados', { headers: authHeader() }) 
          : Promise.resolve({ data: [] }) // VENDEDOR no necesita empleados
      ]);
      
      setSolicitudes(resSolicitudes.data);
      
      // Solo PRICING y ADMIN necesitan lista de empleados para asignar
      if (rol === 'PRICING' || rol === 'ADMIN') {
        setEmpleados(resEmpleados.data.filter(e => e.rol === 'PRICING' && e.estado === 'ACTIVO'));
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrado memoizado para mejor rendimiento
  const solicitudesFiltradas = useMemo(() => {
    let resultado = [...solicitudes];

    // Filtrar por estado
    if (filtro !== 'TODAS') {
      resultado = resultado.filter(s => s.estado === filtro);
    }

    // Filtrar por fecha
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    if (filtroFecha === 'HOY') {
      resultado = resultado.filter(s => {
        const fecha = new Date(s.creadoEn);
        return fecha >= inicioHoy;
      });
    } else if (filtroFecha === 'SEMANA') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - 7);
      resultado = resultado.filter(s => new Date(s.creadoEn) >= inicioSemana);
    } else if (filtroFecha === 'MES') {
      const inicioMes = new Date(hoy);
      inicioMes.setDate(hoy.getDate() - 30);
      resultado = resultado.filter(s => new Date(s.creadoEn) >= inicioMes);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(s =>
        s.folioCodigo?.toLowerCase().includes(termino) ||
        s.clienteNombre?.toLowerCase().includes(termino) ||
        s.origenCiudad?.toLowerCase().includes(termino) ||
        s.destinoCiudad?.toLowerCase().includes(termino) ||
        s.tipoServicio?.toLowerCase().includes(termino) ||
        s.empresaCodigo?.toLowerCase().includes(termino)
      );
    }

    // Ordenar por fecha de creación descendente
    return resultado.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
  }, [solicitudes, filtro, filtroFecha, busqueda]);

  // Calcular solicitudes paginadas
  const solicitudesPaginadas = useMemo(() => {
    const startIndex = (paginaActual - 1) * elementosPorPagina;
    const endIndex = startIndex + elementosPorPagina;
    return solicitudesFiltradas.slice(startIndex, endIndex);
  }, [solicitudesFiltradas, paginaActual, elementosPorPagina]);

  const abrirDetalle = async (solicitud) => {
    try {
      const res = await api.get(`/solicitudes/${solicitud.id}`);
      setSolicitudSeleccionada(res.data);
      setModalDetalle(true);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el detalle de la solicitud',
      });
    }
  };

  // Función para abrir historial
  const abrirHistorial = (solicitud) => {
    setEntidadHistorial({
      tipo: 'SOLICITUD',
      id: solicitud.id,
      titulo: `Historial - ${solicitud.folioCodigo}`
    });
    setModalHistorial(true);
  };

  const abrirModalAsignar = (solicitud) => {
    // Verificar permisos
    if (!permisos.puedeAsignar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para asignar solicitudes.',
      });
      return;
    }
    
    setSolicitudSeleccionada(solicitud);
    resetAsignacion({ empleadoId: '' });
    setModalAsignar(true);
  };

  const cerrarModal = () => {
    setModalDetalle(false);
    setModalAsignar(false);
    setSolicitudSeleccionada(null);
    resetAsignacion();
  };

  const asignarSolicitud = async () => {
    // Verificar permisos
    if (!permisos.puedeAsignar) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para asignar solicitudes.',
      });
      return;
    }

    if (!formAsignacion.empleadoId) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un empleado',
        text: 'Debe seleccionar un empleado de pricing',
      });
      return;
    }

    try {
      await api.put(`/solicitudes/${solicitudSeleccionada.id}/asignar`, null, {
        params: { empleadoId: formAsignacion.empleadoId }
      });

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud asignada',
        timer: 1500,
        showConfirmButton: false,
      });

      cerrarModal();
      cargarDatos();
    } catch (err) {
      console.error('Error asignando solicitud:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo asignar la solicitud',
      });
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    // Verificar permisos
    if (!permisos.puedeCambiarEstado) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para cambiar el estado de solicitudes.',
      });
      return;
    }

    const entidad = location.pathname.includes('cotizaciones') ? 'COTIZACION' : 'SOLICITUD';
    const estadoActual = solicitudes.find(s => s.id === id)?.estado;
    
    if (!validarTransicion(entidad, estadoActual, nuevoEstado)) {
      Swal.fire({
        icon: 'error',
        title: 'Transición no permitida',
        text: `No se puede cambiar de ${estadoActual} a ${nuevoEstado}`,
      });
      return;
    }
    
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `¿Deseas cambiar el estado a ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#5b4cdb',
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/solicitudes/${id}/estado`, null, {
        params: { estado: nuevoEstado }
      });
      
      // Actualización optimista
      setSolicitudes(prev => prev.map(s => 
        s.id === id ? { ...s, estado: nuevoEstado } : s
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        timer: 1500,
        showConfirmButton: false,
      });

      cargarDatos();
    } catch (err) {
      console.error('Error cambiando estado:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado',
      });
    }
  };

  // Funciones helper para renderizado
  const getEstadoIcon = (estado) => {
    const icons = {
      PENDIENTE: 'fa-clock',
      ENVIADO: 'fa-paper-plane',
      COMPLETADO: 'fa-circle-check',
      CANCELADO: 'fa-circle-xmark',
    };
    return icons[estado] || 'fa-clock';
  };

  const getTipoServicioIcon = (tipo) => {
    const icons = {
      TERRESTRE: 'fa-truck',
      MARITIMO: 'fa-ship',
      AEREO: 'fa-plane',
      MULTIMODAL: 'fa-route',
      EXCESO_DIMENSIONES: 'fa-ruler-combined',
    };
    return icons[tipo] || 'fa-box';
  };

  // Configuración de estadísticas
  const statsData = [
    {
      label: 'Total Solicitudes',
      value: solicitudes.length,
      icon: 'fa-list-check',
      iconClass: 'stat-icon-total'
    },
    {
      label: 'Pendientes',
      value: solicitudes.filter(s => s.estado === 'PENDIENTE').length,
      icon: 'fa-clock',
      iconClass: 'stat-icon-pendientes'
    },
    {
      label: 'En Proceso',
      value: solicitudes.filter(s => s.estado === 'ENVIADO').length,
      icon: 'fa-paper-plane',
      iconClass: 'stat-icon-enviadas'
    },
    {
      label: 'Completadas',
      value: solicitudes.filter(s => s.estado === 'COMPLETADO').length,
      icon: 'fa-circle-check',
      iconClass: 'stat-icon-completadas'
    }
  ];

  // Configuración de columnas para DataTable
  const columns = [
    {
      header: 'Folio',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-barcode" style={{ color: '#5b4cdb' }}></i>
          <strong>{s.folioCodigo}</strong>
        </div>
      )
    },
    {
      header: 'Empresa',
      render: (s) => (
        <Badge type="activo" icon="fa-building">
          {s.empresaCodigo}
        </Badge>
      )
    },
    {
      header: 'Cliente',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-building" style={{ color: '#64748b' }}></i>
          {s.clienteNombre}
        </div>
      )
    },
    {
      header: 'Tipo Servicio',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className={`fa-solid ${getTipoServicioIcon(s.tipoServicio)}`} style={{ color: '#5b4cdb' }}></i>
          <span style={{ fontSize: '0.85rem' }}>{s.tipoServicio}</span>
        </div>
      )
    },
    {
      header: 'Origen → Destino',
      render: (s) => (
        <div style={{ fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <i className="fa-solid fa-location-dot" style={{ color: '#10b981', fontSize: '0.7rem' }}></i>
            <span>{s.origenCiudad}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fa-solid fa-flag-checkered" style={{ color: '#ef4444', fontSize: '0.7rem' }}></i>
            <span>{s.destinoCiudad}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Fecha',
      render: (s) => (
        <span style={{ fontSize: '0.85rem' }}>
          {new Date(s.creadoEn).toLocaleDateString('es-MX', { 
            day: '2-digit', 
            month: 'short' 
          })}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (s) => (
        <Badge type={s.estado.toLowerCase()} icon={getEstadoIcon(s.estado)}>
          {s.estado}
        </Badge>
      )
    },
    {
      header: 'Asignado',
      render: (s) => (
        s.asignadoAId ? (
          <Badge type="activo" icon="fa-user-check">
            Asignado
          </Badge>
        ) : (
          <Badge type="inactivo" icon="fa-user-xmark">
            Sin asignar
          </Badge>
        )
      )
    }
  ];

  // Configuración de acciones para DropdownActions - MODIFICADO CON PERMISOS
  const getAcciones = (solicitud) => {
    const items = [
      {
        label: 'Ver Detalles',
        icon: 'fa-eye',
        onClick: () => abrirDetalle(solicitud)
      },
      {
        label: 'Ver Historial',
        icon: 'fa-history',
        onClick: () => abrirHistorial(solicitud)
      }
    ];

    // Solo PRICING/ADMIN pueden asignar (y solo si está pendiente y sin asignar)
    if (permisos.puedeAsignar && !solicitud.asignadoAId && solicitud.estado === 'PENDIENTE') {
      items.push({ divider: true });
      items.push({
        label: 'Asignar a Pricing',
        icon: 'fa-user-plus',
        onClick: () => abrirModalAsignar(solicitud),
        customIconStyle: { color: '#10b981' }
      });
    }

    // Solo PRICING/ADMIN pueden cambiar estado
    if (permisos.puedeCambiarEstado) {
      if (solicitud.estado === 'PENDIENTE' || solicitud.estado === 'ENVIADO') {
        items.push({ divider: true });
        
        if (solicitud.estado === 'PENDIENTE') {
          items.push({
            label: 'Marcar como Enviado',
            icon: 'fa-paper-plane',
            onClick: () => cambiarEstado(solicitud.id, 'ENVIADO'),
            customIconStyle: { color: '#3b82f6' }
          });
        }

        if (solicitud.estado === 'ENVIADO') {
          items.push({
            label: 'Marcar como Completado',
            icon: 'fa-circle-check',
            onClick: () => cambiarEstado(solicitud.id, 'COMPLETADO'),
            customIconStyle: { color: '#10b981' }
          });
        }

        items.push({
          label: 'Cancelar',
          icon: 'fa-ban',
          onClick: () => cambiarEstado(solicitud.id, 'CANCELADO'),
          danger: true
        });
      }
    }

    return items;
  };

  // Botones de filtro de fecha como componente reutilizable
  const FiltrosFecha = () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {[
        { valor: 'TODAS', label: 'Todas' },
        { valor: 'HOY', label: 'Hoy' },
        { valor: 'SEMANA', label: '7 días' },
        { valor: 'MES', label: '30 días' }
      ].map((f) => (
        <button
          key={f.valor}
          className={`btn btn-sm ${filtroFecha === f.valor ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFiltroFecha(f.valor)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader titulo={rol === 'VENDEDOR' ? "Mis Solicitudes" : "Todas las Solicitudes"} />
          <main className="main-panel">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando solicitudes...</p>
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
          titulo={rol === 'VENDEDOR' ? "Mis Solicitudes" : "Todas las Solicitudes"}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODAS', label: 'Todos los Estados' },
            { valor: 'PENDIENTE', label: 'Pendientes' },
            { valor: 'ENVIADO', label: 'Enviadas' },
            { valor: 'COMPLETADO', label: 'Completadas' },
            { valor: 'CANCELADO', label: 'Canceladas' }
          ]}
          // Solo VENDEDOR ve botón de Nueva Solicitud en esta vista
          onAgregarClick={permisos.puedeCrear ? () => navigate('/solicitudes/nueva') : undefined}
        />
        
        <main className="main-panel">
          {/* Info Section con Filtros de Fecha */}
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
              <i className="fa-solid fa-filter"></i>
              <span>Mostrando:</span>
              <span className="info-value">{solicitudesFiltradas.length} de {solicitudes.length}</span>
            </div>
            <div className="info-item">
              <FiltrosFecha />
            </div>
          </div>

          {/* Stats Grid Component */}
          <StatsGrid stats={statsData} />

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Controles de paginación (superior) */}
          {solicitudesFiltradas.length > 0 && (
            <Paginacion
              paginaActual={paginaActual}
              totalElementos={solicitudesFiltradas.length}
              elementosPorPagina={elementosPorPagina}
              onChangePagina={setPaginaActual}
            />
          )}

          {/* DataTable Component */}
          <DataTable
            data={solicitudesPaginadas}
            columns={columns}
            renderActions={(solicitud) => (
              <DropdownActions
                items={getAcciones(solicitud)}
                buttonLabel={
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                }
              />
            )}
            emptyMessage="No se encontraron solicitudes"
            emptyIcon="fa-inbox"
          />

          {/* Controles de paginación (inferior) */}
          {solicitudesFiltradas.length > 0 && (
            <Paginacion
              paginaActual={paginaActual}
              totalElementos={solicitudesFiltradas.length}
              elementosPorPagina={elementosPorPagina}
              onChangePagina={setPaginaActual}
            />
          )}
        </main>
        
        <Footer />
      </div>

      {/* Modal de Detalle usando componente Modal */}
      <Modal
        isOpen={modalDetalle && solicitudSeleccionada}
        onClose={cerrarModal}
        title={
          <>
            <i className="fa-solid fa-file-lines"></i> Detalle de Solicitud
          </>
        }
        large={true}
        footer={
          <button className="btn btn-secondary" onClick={cerrarModal}>
            <i className="fa-solid fa-times"></i> Cerrar
          </button>
        }
      >
        {solicitudSeleccionada && (
          <>
            <div className="solicitud-header-detail">
              <div className="detail-row">
                <div className="detail-col">
                  <label><i className="fa-solid fa-barcode"></i> Folio</label>
                  <div className="detail-value">{solicitudSeleccionada.folioCodigo}</div>
                </div>
                <div className="detail-col">
                  <label><i className="fa-solid fa-calendar"></i> Fecha Emisión</label>
                  <div className="detail-value">
                    {new Date(solicitudSeleccionada.fechaEmision).toLocaleDateString('es-MX')}
                  </div>
                </div>
                <div className="detail-col">
                  <label><i className="fa-solid fa-traffic-light"></i> Estado</label>
                  <Badge type={solicitudSeleccionada.estado.toLowerCase()}>
                    {solicitudSeleccionada.estado}
                  </Badge>
                </div>
              </div>
            </div>
            {/* ... resto del contenido del modal ... */}
          </>
        )}
      </Modal>

      {/* Modal Asignar usando componente Modal */}
      <Modal
        isOpen={modalAsignar && solicitudSeleccionada}
        onClose={cerrarModal}
        title={
          <>
            <i className="fa-solid fa-user-plus"></i> Asignar Solicitud
          </>
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={cerrarModal}>
              <i className="fa-solid fa-times"></i> Cancelar
            </button>
            <button className="btn btn-primary" onClick={asignarSolicitud}>
              <i className="fa-solid fa-check"></i> Asignar
            </button>
          </>
        }
      >
        {solicitudSeleccionada && (
          <>
            <FormField
              label="Solicitud"
              value={solicitudSeleccionada.folioCodigo}
              disabled={true}
            />
            
            <FormField
              type="select"
              label="Seleccionar Empleado de Pricing"
              name="empleadoId"
              value={formAsignacion.empleadoId}
              onChange={handleAsignacionChange}
              options={[
                { value: '', label: '-- Seleccione un empleado --' },
                ...empleados.map(emp => ({
                  value: emp.id,
                  label: `${emp.nombre} (${emp.email})`
                }))
              ]}
              required={true}
            />
          </>
        )}
      </Modal>
      
      {/* Modal de Historial */}
      <HistorialModal
        isOpen={modalHistorial}
        onClose={() => setModalHistorial(false)}
        tipoEntidad={entidadHistorial.tipo}
        entidadId={entidadHistorial.id}
        titulo={entidadHistorial.titulo}
      />
    </div>
  );
}