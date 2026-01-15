// src/pages/Cotizaciones.jsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Subheader from '../components/Subheader';
import Footer from '../components/Footer';
import '../styles/dashboard.css';
import '../styles/empleados.css'; // reutilizamos estilos

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const cotizacionesFiltradas = cotizaciones.filter(c => {
    const coincideBusqueda =
      c.origen.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtro === 'TODAS' || c.estado === filtro;

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
          titulo="Cotizaciones Recientes"
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
                  <th>Servicio</th>
                  <th>Origen-Destino</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map(c => (
                  <tr key={c.id}>
                    <td>{c.solicitud?.folioCodigo}</td>
                    <td>{c.solicitud?.cliente?.nombre}</td>
                    <td>{c.proveedor?.nombre}</td>
                    <td>{c.tipoTransporte}</td>
                    <td>{c.origen} → {c.destino}</td>
                    <td>{new Date(c.creadoEn).toLocaleDateString('es-MX')}</td>
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(c.estado)}`}>
                        {c.estado}
                      </span>
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
