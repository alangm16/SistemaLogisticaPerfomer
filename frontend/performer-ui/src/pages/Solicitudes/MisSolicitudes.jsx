// src/pages/solicitudes/MisSolicitudes.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import DataTable from '../../components/DataTable';
import DropdownActions from '../../components/DropdownActions';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import StatsGrid from '../../components/StatsGrid';
import HistorialModal from '../../components/HistorialModal';
import Paginacion from '../../components/Paginacion'; // Importar componente
import useWorkflow from '../../hooks/useWorkflow';
import Swal from 'sweetalert2';
import authHeader from '../../services/authHeader';
import '../../styles/dashboard.css';
import '../../styles/solicitudes.css';
import '../../styles/generales.css';

export default function MisSolicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [entidadHistorial, setEntidadHistorial] = useState({ tipo: '', id: null });
  
  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(5);
  
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');
  
  // Permisos según rol - AGREGADO
  const permisos = {
    puedeCambiarEstado: rol === 'PRICING', // Solo VENDEDOR y PRICING pueden cambiar estado
    puedeCrear: rol === 'VENDEDOR', // Solo VENDEDOR puede crear nuevas solicitudes
    puedeVerHistorial: true, // Todos pueden ver historial
    puedeVerDetalles: true, // Todos pueden ver detalles
    esVendedor: rol === 'VENDEDOR',
    esPricing: rol === 'PRICING',
    esAdmin: rol === 'ADMIN'
  };
  
  const { validarTransicion } = useWorkflow();
  
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  // Función para abrir historial
  const abrirHistorial = (solicitud) => {
    setEntidadHistorial({
      tipo: 'SOLICITUD',
      id: solicitud.id,
      titulo: `Historial - ${solicitud.folioCodigo}`
    });
    setModalHistorial(true);
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await api.get("/solicitudes/mis", { headers: authHeader() });
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      setError("No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  // Usar useMemo para filtrar eficientemente
  const solicitudesFiltradas = useMemo(() => {
    let resultado = [...solicitudes];

    // Filtrar por estado
    if (filtro !== 'TODAS') {
      resultado = resultado.filter(s => s.estado === filtro);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(s =>
        s.folioCodigo?.toLowerCase().includes(termino) ||
        s.clienteNombre?.toLowerCase().includes(termino) ||
        s.origenCiudad?.toLowerCase().includes(termino) ||
        s.destinoCiudad?.toLowerCase().includes(termino) ||
        s.tipoServicio?.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }, [solicitudes, filtro, busqueda]);

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

  const cerrarModal = () => {
    setModalDetalle(false);
    setSolicitudSeleccionada(null);
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

    // Validar workflow
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
      
      // Actualizar lista local
      setSolicitudes(solicitudes.map(s => 
        s.id === id ? { ...s, estado: nuevoEstado } : s
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        timer: 1500,
        showConfirmButton: false,
      });

      cargarSolicitudes();
    } catch (err) {
      console.error('Error cambiando estado:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado',
      });
    }
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

  // Configuración de stats
  const statsData = useMemo(() => {
    const contadores = {
      total: solicitudes.length,
      pendientes: solicitudes.filter(s => s.estado === 'PENDIENTE').length,
      enviadas: solicitudes.filter(s => s.estado === 'ENVIADO').length,
      completadas: solicitudes.filter(s => s.estado === 'COMPLETADO').length,
    };

    return [
      {
        label: 'Total Solicitudes',
        value: contadores.total,
        icon: 'fa-file-lines',
        iconClass: 'stat-icon-total'
      },
      {
        label: 'Pendientes',
        value: contadores.pendientes,
        icon: 'fa-clock',
        iconClass: 'stat-icon-pendientes'
      },
      {
        label: 'Enviadas',
        value: contadores.enviadas,
        icon: 'fa-paper-plane',
        iconClass: 'stat-icon-enviadas'
      },
      {
        label: 'Completadas',
        value: contadores.completadas,
        icon: 'fa-circle-check',
        iconClass: 'stat-icon-completadas'
      }
    ];
  }, [solicitudes]);

  // Configuración de columnas para DataTable
  const columns = [
    {
      header: 'Folio',
      render: (s) => (
        <div className="user-cell">
          <i className="fa-solid fa-barcode" style={{ color: '#5b4cdb' }}></i>
          <span className="user-name-text"><strong>{s.folioCodigo}</strong></span>
        </div>
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
          {s.tipoServicio}
        </div>
      )
    },
    {
      header: 'Origen → Destino',
      render: (s) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <i className="fa-solid fa-location-dot" style={{ color: '#10b981', fontSize: '0.75rem' }}></i>
            <span>{s.origenCiudad}, {s.origenPais}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className="fa-solid fa-flag-checkered" style={{ color: '#ef4444', fontSize: '0.75rem' }}></i>
            <span>{s.destinoCiudad}, {s.destinoPais}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Fecha Emisión',
      render: (s) => new Date(s.fechaEmision).toLocaleDateString('es-MX')
    },
    {
      header: 'Estado',
      render: (s) => {
        const badgeTypes = {
          PENDIENTE: 'pendiente',
          ENVIADO: 'enviado',
          COMPLETADO: 'completado',
          CANCELADO: 'cancelado'
        };
        return (
          <Badge type={badgeTypes[s.estado] || 'pendiente'}>
            {s.estado}
          </Badge>
        );
      }
    }
  ];

  // Renderizar acciones para DataTable - MODIFICADO CON PERMISOS
  const renderActions = (solicitud) => {
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

    // Solo VENDEDOR y PRICING pueden cambiar estado (solo pendientes)
    if (permisos.puedeCambiarEstado && solicitud.estado === 'PENDIENTE') {
      items.push({ divider: true });
      items.push(
        {
          label: 'Marcar como Enviado',
          icon: 'fa-paper-plane',
          onClick: () => cambiarEstado(solicitud.id, 'ENVIADO')
        },
        {
          label: 'Cancelar',
          icon: 'fa-ban',
          onClick: () => cambiarEstado(solicitud.id, 'CANCELADO'),
          danger: true
        }
      );
    }

    return (
      <DropdownActions
        items={items}
        buttonLabel={<i className="fa-solid fa-ellipsis-vertical"></i>}
      />
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader titulo="Mis Solicitudes" />
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
          titulo="Mis Solicitudes"
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtro={filtro}
          onFiltroChange={setFiltro}
          filtros={[
            { valor: 'TODAS', label: 'Todas' },
            { valor: 'PENDIENTE', label: 'Pendientes' },
            { valor: 'ENVIADO', label: 'Enviadas' },
            { valor: 'COMPLETADO', label: 'Completadas' },
            { valor: 'CANCELADO', label: 'Canceladas' }
          ]}
          // Solo VENDEDOR ve botón de Nueva Solicitud
          onAgregarClick={permisos.puedeCrear ? () => navigate('/solicitudes/nueva') : undefined}
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
              <i className="fa-solid fa-user"></i>
              <span>Creadas por:</span>
              <span className="info-value">{nombre}</span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-filter"></i>
              <span>Mostrando:</span>
              <span className="info-value">
                {solicitudesFiltradas.length} de {solicitudes.length}
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
          {solicitudesFiltradas.length > 0 && (
            <Paginacion
              paginaActual={paginaActual}
              totalElementos={solicitudesFiltradas.length}
              elementosPorPagina={elementosPorPagina}
              onChangePagina={setPaginaActual}
            />
          )}

          {/* Data Table */}
          <DataTable
            data={solicitudesPaginadas}
            columns={columns}
            renderActions={renderActions}
            emptyMessage="No se encontraron solicitudes"
            emptyIcon="fa-inbox"
            emptyAction={
              solicitudes.length === 0 && permisos.puedeCrear && (
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/solicitudes/nueva')}
                  style={{ marginTop: '1rem' }}
                >
                  <i className="fa-solid fa-plus"></i>
                  Crear Primera Solicitud
                </button>
              )
            }
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

      {/* Modal de Detalle */}
      <Modal
        isOpen={modalDetalle}
        onClose={cerrarModal}
        title={
          <>
            <i className="fa-solid fa-file-lines"></i> Detalle de Solicitud
          </>
        }
        large={true}
        footer={
          <button className="btn btn-secondary" onClick={cerrarModal}>
            <i className="fa-solid fa-times"></i>
            Cerrar
          </button>
        }
      >
        {solicitudSeleccionada && (
          <>
            {/* Header de la solicitud */}
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

            {/* Cliente y Servicio */}
            <div className="detail-section">
              <h4><i className="fa-solid fa-building"></i> Cliente y Servicio</h4>
              <div className="detail-row">
                <div className="detail-col">
                  <label>Cliente</label>
                  <div className="detail-value">{solicitudSeleccionada.clienteNombre}</div>
                </div>
                <div className="detail-col">
                  <label>Tipo de Servicio</label>
                  <div className="detail-value">
                    <i className={`fa-solid ${getTipoServicioIcon(solicitudSeleccionada.tipoServicio)}`}></i>
                    {' '}{solicitudSeleccionada.tipoServicio}
                  </div>
                </div>
                <div className="detail-col">
                  <label>Empresa</label>
                  <div className="detail-value">{solicitudSeleccionada.empresaCodigo}</div>
                </div>
              </div>
            </div>

            {/* Origen y Destino */}
            <div className="detail-section">
              <h4><i className="fa-solid fa-map-location-dot"></i> Origen y Destino</h4>
              <div className="origen-destino-detail">
                <div className="location-detail">
                  <h5><i className="fa-solid fa-location-dot"></i> Origen</h5>
                  <p><strong>País:</strong> {solicitudSeleccionada.origenPais}</p>
                  <p><strong>Ciudad:</strong> {solicitudSeleccionada.origenCiudad}</p>
                  {solicitudSeleccionada.origenDireccion && (
                    <p><strong>Dirección:</strong> {solicitudSeleccionada.origenDireccion}</p>
                  )}
                  {solicitudSeleccionada.origenCp && (
                    <p><strong>CP:</strong> {solicitudSeleccionada.origenCp}</p>
                  )}
                </div>
                <div className="location-detail">
                  <h5><i className="fa-solid fa-flag-checkered"></i> Destino</h5>
                  <p><strong>País:</strong> {solicitudSeleccionada.destinoPais}</p>
                  <p><strong>Ciudad:</strong> {solicitudSeleccionada.destinoCiudad}</p>
                  {solicitudSeleccionada.destinoDireccion && (
                    <p><strong>Dirección:</strong> {solicitudSeleccionada.destinoDireccion}</p>
                  )}
                  {solicitudSeleccionada.destinoCp && (
                    <p><strong>CP:</strong> {solicitudSeleccionada.destinoCp}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles del Embarque */}
            <div className="detail-section">
              <h4><i className="fa-solid fa-box"></i> Detalles del Embarque</h4>
              <div className="detail-row">
                <div className="detail-col">
                  <label>Cantidad</label>
                  <div className="detail-value">{solicitudSeleccionada.cantidad}</div>
                </div>
                {solicitudSeleccionada.tipoEmpaque && (
                  <div className="detail-col">
                    <label>Tipo de Empaque</label>
                    <div className="detail-value">{solicitudSeleccionada.tipoEmpaque}</div>
                  </div>
                )}
                {solicitudSeleccionada.pesoKg && (
                  <div className="detail-col">
                    <label>Peso</label>
                    <div className="detail-value">{solicitudSeleccionada.pesoKg} kg</div>
                  </div>
                )}
              </div>

              {(solicitudSeleccionada.largoCm || solicitudSeleccionada.anchoCm || solicitudSeleccionada.altoCm) && (
                <div className="detail-row">
                  <div className="detail-col">
                    <label>Dimensiones (L × A × H)</label>
                    <div className="detail-value">
                      {solicitudSeleccionada.largoCm} × {solicitudSeleccionada.anchoCm} × {solicitudSeleccionada.altoCm} cm
                    </div>
                  </div>
                </div>
              )}

              {solicitudSeleccionada.valorDeclaradoUsd && (
                <div className="detail-row">
                  <div className="detail-col">
                    <label>Valor Declarado</label>
                    <div className="detail-value">${solicitudSeleccionada.valorDeclaradoUsd} USD</div>
                  </div>
                </div>
              )}

              <div className="detail-row">
                <div className="detail-col">
                  <label>Características</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {solicitudSeleccionada.apilable && (
                      <Badge type="activo">
                        <i className="fa-solid fa-layer-group"></i> Apilable
                      </Badge>
                    )}
                    {solicitudSeleccionada.materialPeligroso && (
                      <Badge type="cancelado">
                        <i className="fa-solid fa-triangle-exclamation"></i> Material Peligroso
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
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