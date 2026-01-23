// src/pages/Cotizaciones/Cotizaciones.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/cotizaciones.css';
import '../../styles/generales.css';

export default function Cotizaciones() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status] = useState('ok');
  const [filtro, setFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await api.get('/cotizaciones');
      setCotizaciones(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cotización?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/cotizaciones/${id}`);
      setCotizaciones(c => c.filter(x => x.id !== id));
      
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La cotización fue eliminada.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la cotización.',
      });
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const cotizacion = cotizaciones.find(c => c.id === id);
      const payload = {
        ...cotizacion,
        estado: nuevoEstado
      };
      
      await api.put(`/cotizaciones/${id}`, payload);
      setCotizaciones(c => c.map(x => x.id === id ? { ...x, estado: nuevoEstado } : x));
      
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `La cotización ahora está ${nuevoEstado.toLowerCase()}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado.',
      });
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter(c => {
    const coincideBusqueda =
      c.origen.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.solicitud?.folioCodigo?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro = filtro === 'TODAS' || c.estado === filtro;

    return coincideBusqueda && coincideFiltro;
  });

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'badge-pendiente';
      case 'ENVIADO': return 'badge-activo';
      case 'COMPLETADO': return 'badge-vendedor';
      case 'CANCELADO': return 'badge-inactivo';
      default: return 'badge-default';
    }
  };

  const getTipoTransporteBadgeClass = (tipo) => {
    switch (tipo) {
      case 'TERRESTRE': return 'badge-terrestre';
      case 'MARITIMO': return 'badge-maritimo';
      case 'AEREO': return 'badge-aereo';
      default: return 'badge-default';
    }
  };

  const contadores = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter(c => c.estado === 'PENDIENTE').length,
    enviadas: cotizaciones.filter(c => c.estado === 'ENVIADO').length,
    completadas: cotizaciones.filter(c => c.estado === 'COMPLETADO').length,
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
              <p>Cargando cotizaciones...</p>
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
          titulo="Gestión de Cotizaciones"
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
          onAgregarClick={() => navigate('/cotizaciones/nueva')}
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
              <div className={status === 'ok' ? 'status-indicator' : 'status-indicator error'}></div>
              <span>Sistema:</span>
              <span className="info-value">{status === 'ok' ? 'Operacional' : 'Error'}</span>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-clock"></i>
              <span>Última actualización:</span>
              <span className="info-value">
                {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-total">
                <i className="fa-solid fa-calculator"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.total}</div>
                <div className="stat-label">Total Cotizaciones</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-pendientes">
                <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.pendientes}</div>
                <div className="stat-label">Pendientes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-activos">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{contadores.enviadas}</div>
                <div className="stat-label">Enviadas</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-completadas">
                <i className="fa-solid fa-check-circle"></i>
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
                  <th>Proveedor</th>
                  <th>Tipo</th>
                  <th>Ruta</th>
                  <th>Costo</th>
                  <th>Válido hasta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/cotizaciones/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="folio-badge">
                        {c.solicitud?.folioCodigo || 'N/A'}
                      </span>
                    </td>
                    <td>{c.solicitud?.cliente?.nombre || 'N/A'}</td>
                    <td>{c.proveedor?.nombre || 'N/A'}</td>
                    <td>
                      <span className={`badge ${getTipoTransporteBadgeClass(c.tipoTransporte)}`}>
                        {c.tipoTransporte}
                      </span>
                    </td>
                    <td>
                      <div className="ruta-cell">
                        <span className="ruta-origen">{c.origen}</span>
                        <i className="fa-solid fa-arrow-right ruta-arrow"></i>
                        <span className="ruta-destino">{c.destino}</span>
                      </div>
                    </td>
                    <td className="costo-cell">${c.costo?.toLocaleString('es-MX')}</td>
                    <td>{c.validoHasta ? new Date(c.validoHasta).toLocaleDateString('es-MX') : 'N/A'}</td>
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(c.estado)}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-primary-app dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Opciones
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/cotizaciones/${c.id}`);
                              }}
                            >
                              <i className="fa-solid fa-eye text-purple me-2"></i>
                              Ver Detalles
                            </button>
                          </li>

                          {c.estado === 'PENDIENTE' && (
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cambiarEstado(c.id, 'ENVIADO');
                                }}
                              >
                                <i className="fa-solid fa-paper-plane text-purple me-2"></i>
                                Marcar como Enviado
                              </button>
                            </li>
                          )}

                          {c.estado === 'ENVIADO' && (
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cambiarEstado(c.id, 'COMPLETADO');
                                }}
                              >
                                <i className="fa-solid fa-check text-purple me-2"></i>
                                Marcar como Completado
                              </button>
                            </li>
                          )}

                          <li><hr className="dropdown-divider" /></li>

                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminar(c.id);
                              }}
                            >
                              <i className="fa-solid fa-trash text-danger me-2"></i>
                              Eliminar
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cotizacionesFiltradas.length === 0 && (
              <div className="empty-state">
                <i className="fa-solid fa-file-invoice"></i>
                <p>No se encontraron cotizaciones</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}