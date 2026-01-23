// src/pages/Cotizaciones/Cotizaciones.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Subheader from '../../components/Subheader';
import Footer from '../../components/Footer';
import DataTable from '../../components/DataTable';
import DropdownActions from '../../components/DropdownActions';
import StatsGrid from '../../components/StatsGrid';
import Badge from '../../components/Badge';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/cotizaciones.css';
import '../../styles/generales.css';

export default function Cotizaciones() {
  const navigate = useNavigate();
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

  // Usar useMemo para filtrado eficiente
  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter(c => {
      const coincideBusqueda =
        c.origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.destino?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.solicitud?.folioCodigo?.toLowerCase().includes(busqueda.toLowerCase());

      const coincideFiltro = filtro === 'TODAS' || c.estado === filtro;

      return coincideBusqueda && coincideFiltro;
    });
  }, [cotizaciones, filtro, busqueda]);

  // Configuración de stats
  const statsData = useMemo(() => {
    const contadores = {
      total: cotizaciones.length,
      pendientes: cotizaciones.filter(c => c.estado === 'PENDIENTE').length,
      enviadas: cotizaciones.filter(c => c.estado === 'ENVIADO').length,
      completadas: cotizaciones.filter(c => c.estado === 'COMPLETADO').length,
    };

    return [
      {
        label: 'Total Cotizaciones',
        value: contadores.total,
        icon: 'fa-calculator',
        iconClass: 'stat-icon-total'
      },
      {
        label: 'Pendientes',
        value: contadores.pendientes,
        icon: 'fa-hourglass-half',
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
        icon: 'fa-check-circle',
        iconClass: 'stat-icon-completadas'
      }
    ];
  }, [cotizaciones]);

  // Configuración de columnas para DataTable
  const columns = [
    {
      header: 'Folio',
      render: (c) => (
        <span className="folio-badge">
          {c.solicitud?.folioCodigo || 'N/A'}
        </span>
      )
    },
    {
      header: 'Cliente',
      render: (c) => c.solicitud?.cliente?.nombre || 'N/A'
    },
    {
      header: 'Proveedor',
      render: (c) => c.proveedor?.nombre || 'N/A'
    },
    {
      header: 'Tipo',
      render: (c) => {
        const badgeTypes = {
          TERRESTRE: 'terrestre',
          MARITIMO: 'maritimo',
          AEREO: 'aereo'
        };
        return (
          <Badge type={badgeTypes[c.tipoTransporte] || 'default'}>
            {c.tipoTransporte}
          </Badge>
        );
      }
    },
    {
      header: 'Ruta',
      render: (c) => (
        <div className="ruta-cell">
          <span className="ruta-origen">{c.origen}</span>
          <i className="fa-solid fa-arrow-right ruta-arrow"></i>
          <span className="ruta-destino">{c.destino}</span>
        </div>
      )
    },
    {
      header: 'Costo',
      render: (c) => (
        <span className="costo-cell">
          ${c.costo?.toLocaleString('es-MX') || '0'}
        </span>
      )
    },
    {
      header: 'Válido hasta',
      render: (c) => c.validoHasta 
        ? new Date(c.validoHasta).toLocaleDateString('es-MX') 
        : 'N/A'
    },
    {
      header: 'Estado',
      render: (c) => {
        const badgeTypes = {
          PENDIENTE: 'pendiente',
          ENVIADO: 'activo',
          COMPLETADO: 'vendedor',
          CANCELADO: 'inactivo'
        };
        return (
          <Badge type={badgeTypes[c.estado] || 'default'}>
            {c.estado}
          </Badge>
        );
      }
    }
  ];

  // Renderizar acciones para DataTable
  const renderActions = (cotizacion) => {
    const items = [
      {
        label: 'Ver Detalles',
        icon: 'fa-eye',
        onClick: () => navigate(`/cotizaciones/${cotizacion.id}`)
      }
    ];

    if (cotizacion.estado === 'PENDIENTE') {
      items.push({
        label: 'Marcar como Enviado',
        icon: 'fa-paper-plane',
        onClick: () => cambiarEstado(cotizacion.id, 'ENVIADO')
      });
    }

    if (cotizacion.estado === 'ENVIADO') {
      items.push({
        label: 'Marcar como Completado',
        icon: 'fa-check',
        onClick: () => cambiarEstado(cotizacion.id, 'COMPLETADO')
      });
    }

    items.push({ divider: true });
    items.push({
      label: 'Eliminar',
      icon: 'fa-trash',
      onClick: () => eliminar(cotizacion.id),
      danger: true
    });

    return (
      <DropdownActions
        items={items}
        buttonLabel="Opciones"
      />
    );
  };

  // Manejar clic en fila
  const handleRowClick = (cotizacion) => {
    navigate(`/cotizaciones/${cotizacion.id}`);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar rol={rol} />
        <div className="dashboard-content">
          <Header nombre={nombre} rol={rol} />
          <Subheader titulo="Gestión de Cotizaciones" />
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
              <div className="status-indicator"></div>
              <span>Sistema:</span>
              <span className="info-value">Operacional</span>
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
            data={cotizacionesFiltradas}
            columns={columns}
            onRowClick={handleRowClick}
            renderActions={renderActions}
            emptyMessage="No se encontraron cotizaciones"
            emptyIcon="fa-file-invoice"
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}