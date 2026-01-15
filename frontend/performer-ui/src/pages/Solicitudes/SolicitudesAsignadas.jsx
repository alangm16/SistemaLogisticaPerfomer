// src/pages/solicitudes/SolicitudesAsignadas.jsx
import { useEffect, useState } from 'react';
/* import { useNavigate } from 'react-router-dom'; */
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import authHeader from '../../services/authHeader';
import '../../styles/dashboard.css';
import '../../styles/solicitudes.css';

export default function SolicitudesAsignadas() {
  /* const navigate = useNavigate(); */
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
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

  useEffect(() => {
    filtrarSolicitudes();
  }, [solicitudes, filtro, busqueda]);

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

  const filtrarSolicitudes = () => {
    let resultado = [...solicitudes];

    if (filtro !== 'TODAS') {
      resultado = resultado.filter(s => s.estado === filtro);
    }

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

    setSolicitudesFiltradas(resultado);
  };

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

  const getBadgeClass = (estado) => {
    const badges = {
      PENDIENTE: 'badge-pendiente',
      ENVIADO: 'badge-enviado',
      COMPLETADO: 'badge-completado',
      CANCELADO: 'badge-cancelado',
    };
    return badges[estado] || 'badge-pendiente';
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

  const contadores = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'PENDIENTE').length,
    enviadas: solicitudes.filter(s => s.estado === 'ENVIADO').length,
    completadas: solicitudes.filter(s => s.estado === 'COMPLETADO').length,
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader titulo="Solicitudes Asignadas" />
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

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-total">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.total}</div>
                <div className="stat-label">Total Asignadas</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-pendientes">
                <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.pendientes}</div>
                <div className="stat-label">Por Procesar</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-enviadas">
                <i className="fa-solid fa-spinner"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.enviadas}</div>
                <div className="stat-label">En Proceso</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-completadas">
                <i className="fa-solid fa-check-double"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.completadas}</div>
                <div className="stat-label">Completadas</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Tipo Servicio</th>
                  <th>Origen → Destino</th>
                  <th>Fecha Emisión</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map(solicitud => (
                  <tr key={solicitud.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-barcode" style={{ color: '#5b4cdb' }}></i>
                        <strong>{solicitud.folioCodigo}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-building" style={{ color: '#64748b' }}></i>
                        {solicitud.clienteNombre}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className={`fa-solid ${getTipoServicioIcon(solicitud.tipoServicio)}`} style={{ color: '#5b4cdb' }}></i>
                        {solicitud.tipoServicio}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: '#10b981', fontSize: '0.75rem' }}></i>
                          <span>{solicitud.origenCiudad}, {solicitud.origenPais}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="fa-solid fa-flag-checkered" style={{ color: '#ef4444', fontSize: '0.75rem' }}></i>
                          <span>{solicitud.destinoCiudad}, {solicitud.destinoPais}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {new Date(solicitud.fechaEmision).toLocaleDateString('es-MX')}
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(solicitud.estado)}`}>
                        <i className={`fa-solid ${getEstadoIcon(solicitud.estado)}`}></i>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-primary-app dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => abrirDetalle(solicitud)}
                            >
                              <i className="fa-solid fa-eye text-purple me-2"></i>
                              Ver Detalles
                            </button>
                          </li>

                          {(solicitud.estado === 'PENDIENTE' || solicitud.estado === 'ENVIADO') && (
                            <>
                              <li><hr className="dropdown-divider" /></li>
                              
                              {solicitud.estado === 'PENDIENTE' && (
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => cambiarEstado(solicitud.id, 'ENVIADO')}
                                  >
                                    <i className="fa-solid fa-paper-plane me-2" style={{ color: '#3b82f6' }}></i>
                                    Marcar como Enviado
                                  </button>
                                </li>
                              )}

                              {solicitud.estado === 'ENVIADO' && (
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => cambiarEstado(solicitud.id, 'COMPLETADO')}
                                  >
                                    <i className="fa-solid fa-circle-check me-2" style={{ color: '#10b981' }}></i>
                                    Marcar como Completado
                                  </button>
                                </li>
                              )}

                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => cambiarEstado(solicitud.id, 'CANCELADO')}
                                >
                                  <i className="fa-solid fa-ban text-danger me-2"></i>
                                  Cancelar
                                </button>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {solicitudesFiltradas.length === 0 && (
              <div className="empty-state">
                <i className="fa-solid fa-clipboard-question"></i>
                <p>No hay solicitudes asignadas</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Modal de Detalle */}
      {modalDetalle && solicitudSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-file-lines"></i> Detalle de Solicitud
              </h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
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
                    <span className={`badge ${getBadgeClass(solicitudSeleccionada.estado)}`}>
                      {solicitudSeleccionada.estado}
                    </span>
                  </div>
                </div>
              </div>

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
                        <span className="badge badge-activo">
                          <i className="fa-solid fa-layer-group"></i> Apilable
                        </span>
                      )}
                      {solicitudSeleccionada.materialPeligroso && (
                        <span className="badge badge-cancelado">
                          <i className="fa-solid fa-triangle-exclamation"></i> Material Peligroso
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}