// src/pages/solicitudes/SolicitudesAsignadas.jsx
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import DataTable from '../../components/DataTable';
import DropdownActions from '../../components/DropdownActions';
import Modal from '../../components/Modal';
import StatsGrid from '../../components/StatsGrid';
import Badge from '../../components/Badge';
import Swal from 'sweetalert2';
import authHeader from '../../services/authHeader';
import '../../styles/dashboard.css';
import '../../styles/solicitudes.css';
import '../../styles/generales.css';

export default function SolicitudesAsignadas() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const res = await api.get('/solicitudes/asignadas', { headers: authHeader() });
      setSolicitudes(res.data);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
      setError('No se pudieron cargar las solicitudes asignadas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de solicitudes
  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideBusqueda = 
      s.folioCodigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.origenCiudad?.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.destinoCiudad?.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.tipoServicio?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideFiltro = filtro === 'TODAS' || s.estado === filtro;
    
    return coincideBusqueda && coincideFiltro;
  });

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
      
      // Actualizar estado local
      setSolicitudes(solicitudes.map(s => 
        s.id === id ? { ...s, estado: nuevoEstado } : s
      ));

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        timer: 1500,
        showConfirmButton: false,
      });

      cargarSolicitudes(); // Recargar para obtener datos actualizados
    } catch (err) {
      console.error('Error cambiando estado:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado',
      });
    }
  };

  // Funciones auxiliares
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

  const getEstadoIcon = (estado) => {
    const icons = {
      PENDIENTE: 'fa-clock',
      ENVIADO: 'fa-paper-plane',
      COMPLETADO: 'fa-circle-check',
      CANCELADO: 'fa-circle-xmark',
    };
    return icons[estado] || 'fa-clock';
  };

  // Contadores para las stats
  const contadores = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'PENDIENTE').length,
    enviadas: solicitudes.filter(s => s.estado === 'ENVIADO').length,
    completadas: solicitudes.filter(s => s.estado === 'COMPLETADO').length,
  };

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
      render: (s) => (
        <Badge type={s.estado.toLowerCase()}>
          <i className={`fa-solid ${getEstadoIcon(s.estado)}`}></i>
          {s.estado}
        </Badge>
      )
    }
  ];

  // Configuración de stats para StatsGrid
  const statsData = [
    {
      label: 'Total Asignadas',
      value: contadores.total,
      icon: 'fa-clipboard-list',
      iconClass: 'stat-icon-total'
    },
    {
      label: 'Por Procesar',
      value: contadores.pendientes,
      icon: 'fa-hourglass-half',
      iconClass: 'stat-icon-pendientes'
    },
    {
      label: 'En Proceso',
      value: contadores.enviadas,
      icon: 'fa-spinner',
      iconClass: 'stat-icon-enviadas'
    },
    {
      label: 'Completadas',
      value: contadores.completadas,
      icon: 'fa-check-double',
      iconClass: 'stat-icon-completadas'
    }
  ];

  // Obtener acciones dinámicas según el estado de la solicitud
  const getAccionesSolicitud = (solicitud) => {
    const acciones = [
      {
        label: 'Ver Detalles',
        icon: 'fa-eye',
        onClick: () => abrirDetalle(solicitud)
      }
    ];

    // Solo agregar acciones de cambio de estado si está pendiente o enviada
    if (solicitud.estado === 'PENDIENTE' || solicitud.estado === 'ENVIADO') {
      acciones.push({ divider: true });
      
      if (solicitud.estado === 'PENDIENTE') {
        acciones.push({
          label: 'Marcar como Enviado',
          icon: 'fa-paper-plane',
          iconColor: '#3b82f6',
          onClick: () => cambiarEstado(solicitud.id, 'ENVIADO')
        });
      }

      if (solicitud.estado === 'ENVIADO') {
        acciones.push({
          label: 'Marcar como Completado',
          icon: 'fa-circle-check',
          iconColor: '#10b981',
          onClick: () => cambiarEstado(solicitud.id, 'COMPLETADO')
        });
      }

      acciones.push({
        label: 'Cancelar',
        icon: 'fa-ban',
        onClick: () => cambiarEstado(solicitud.id, 'CANCELADO'),
        danger: true
      });
    }

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
          titulo="Solicitudes Asignadas"
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
        />

        <main className="main-panel">
          {/* Info Section Personalizada para Solicitudes */}
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
              <i className="fa-solid fa-user-check"></i>
              <span>Asignadas a:</span>
              <span className="info-value">{nombre}</span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-filter"></i>
              <span>Mostrando:</span>
              <span className="info-value">{solicitudesFiltradas.length} de {solicitudes.length}</span>
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
            data={solicitudesFiltradas}
            columns={columns}
            renderActions={(solicitud) => (
              <DropdownActions
                items={getAccionesSolicitud(solicitud)}
                buttonLabel={<i className="fa-solid fa-ellipsis-vertical"></i>}
              />
            )}
            emptyMessage="No hay solicitudes asignadas"
            emptyIcon="fa-clipboard-question"
          />
        </main>

        <Footer />
      </div>

      {/* Modal de Detalle de Solicitud */}
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
            <i className="fa-solid fa-times"></i>
            Cerrar
          </button>
        }
      >
        {solicitudSeleccionada && (
          <div className="solicitud-detail-content">
            {/* Encabezado de la solicitud */}
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

              {/* Características especiales */}
              {(solicitudSeleccionada.apilable || solicitudSeleccionada.materialPeligroso) && (
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
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}