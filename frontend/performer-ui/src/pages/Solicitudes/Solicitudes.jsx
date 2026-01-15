// src/pages/solicitudes/Solicitudes.jsx
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

export default function Solicitudes() {
  /* const navigate = useNavigate(); */
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('TODAS');
  const [filtroFecha, setFiltroFecha] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarSolicitudes();
  }, [solicitudes, filtro, filtroFecha, busqueda]);

  const cargarDatos = async () => {
    try {
      const [resSolicitudes, resEmpleados] = await Promise.all([
        api.get('/solicitudes', { headers: authHeader() }),
        api.get('/empleados', { headers: authHeader() })
      ]);
      
      setSolicitudes(resSolicitudes.data);
      setEmpleados(resEmpleados.data.filter(e => e.rol === 'PRICING' && e.estado === 'ACTIVO'));
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarSolicitudes = () => {
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
    resultado.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));

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

  const abrirModalAsignar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setEmpleadoSeleccionado('');
    setModalAsignar(true);
  };

  const cerrarModal = () => {
    setModalDetalle(false);
    setModalAsignar(false);
    setSolicitudSeleccionada(null);
    setEmpleadoSeleccionado('');
  };

  const asignarSolicitud = async () => {
    if (!empleadoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un empleado',
        text: 'Debe seleccionar un empleado de pricing',
      });
      return;
    }

    try {
      await api.put(`/solicitudes/${solicitudSeleccionada.id}/asignar`, null, {
        params: { empleadoId: empleadoSeleccionado }
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
          <Subheader titulo="Todas las Solicitudes" />
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
          titulo="Todas las Solicitudes"
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
              <i className="fa-solid fa-filter"></i>
              <span>Mostrando:</span>
              <span className="info-value">{solicitudesFiltradas.length} de {solicitudes.length}</span>
            </div>
            <div className="info-item">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn btn-sm ${filtroFecha === 'TODAS' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroFecha('TODAS')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  Todas
                </button>
                <button
                  className={`btn btn-sm ${filtroFecha === 'HOY' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroFecha('HOY')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  Hoy
                </button>
                <button
                  className={`btn btn-sm ${filtroFecha === 'SEMANA' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroFecha('SEMANA')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  7 días
                </button>
                <button
                  className={`btn btn-sm ${filtroFecha === 'MES' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFiltroFecha('MES')}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  30 días
                </button>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-total">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.total}</div>
                <div className="stat-label">Total Solicitudes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-pendientes">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.pendientes}</div>
                <div className="stat-label">Pendientes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-enviadas">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.enviadas}</div>
                <div className="stat-label">En Proceso</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-completadas">
                <i className="fa-solid fa-circle-check"></i>
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
                  <th>Empresa</th>
                  <th>Cliente</th>
                  <th>Tipo Servicio</th>
                  <th>Origen → Destino</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Asignado</th>
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
                      <span className="badge badge-activo" style={{ fontSize: '0.7rem' }}>
                        {solicitud.empresaCodigo}
                      </span>
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
                        <span style={{ fontSize: '0.85rem' }}>{solicitud.tipoServicio}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                          <i className="fa-solid fa-location-dot" style={{ color: '#10b981', fontSize: '0.7rem' }}></i>
                          <span>{solicitud.origenCiudad}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="fa-solid fa-flag-checkered" style={{ color: '#ef4444', fontSize: '0.7rem' }}></i>
                          <span>{solicitud.destinoCiudad}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(solicitud.creadoEn).toLocaleDateString('es-MX', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(solicitud.estado)}`}>
                        <i className={`fa-solid ${getEstadoIcon(solicitud.estado)}`}></i>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td>
                      {solicitud.asignadoAId ? (
                        <span className="badge badge-activo">
                          <i className="fa-solid fa-user-check"></i> Asignado
                        </span>
                      ) : (
                        <span className="badge badge-inactivo">
                          <i className="fa-solid fa-user-xmark"></i> Sin asignar
                        </span>
                      )}
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

                          {!solicitud.asignadoAId && solicitud.estado === 'PENDIENTE' && (
                            <>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => abrirModalAsignar(solicitud)}
                                >
                                  <i className="fa-solid fa-user-plus me-2" style={{ color: '#10b981' }}></i>
                                  Asignar a Pricing
                                </button>
                              </li>
                            </>
                          )}

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
                <i className="fa-solid fa-inbox"></i>
                <p>No se encontraron solicitudes</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Modal de Detalle (igual que en MisSolicitudes) */}
      {modalDetalle && solicitudSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-file-lines"></i> Detalle de Solicitud</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* Mismo contenido que MisSolicitudes */}
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
              {/* ... resto del modal igual que MisSolicitudes ... */}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar */}
      {modalAsignar && solicitudSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-user-plus"></i> Asignar Solicitud</h3>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <label>Solicitud</label>
                <input
                  type="text"
                  value={solicitudSeleccionada.folioCodigo}
                  disabled
                  className="form-input"
                />
              </div>
              <div className="form-section">
                <label className="required-field">Seleccionar Empleado de Pricing</label>
                <select
                  value={empleadoSeleccionado}
                  onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Seleccione un empleado --</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrarModal}>
                <i className="fa-solid fa-times"></i> Cancelar
              </button>
              <button className="btn btn-primary" onClick={asignarSolicitud}>
                <i className="fa-solid fa-check"></i> Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}