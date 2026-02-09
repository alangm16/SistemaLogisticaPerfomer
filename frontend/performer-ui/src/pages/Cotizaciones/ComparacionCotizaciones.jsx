// src/pages/Cotizaciones/ComparacionCotizaciones.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ComparadorCotizaciones from '../../components/ComparadorCotizaciones';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';
import '../../styles/generales.css';

export default function ComparacionCotizaciones() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const solicitudId = searchParams.get('solicitudId');
  
  const rol = localStorage.getItem('rol');
  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    // Verificar que se proporcionó un ID de solicitud
    if (!solicitudId) {
      Swal.fire({
        icon: 'warning',
        title: 'Solicitud requerida',
        text: 'Debes especificar una solicitud para comparar cotizaciones',
      }).then(() => {
        navigate('/cotizaciones');
      });
    }
  }, [solicitudId, navigate]);

  const handleSeleccionarCotizacion = (cotizacion) => {
    Swal.fire({
      title: 'Cotización seleccionada',
      html: `
        <div style="text-align: left;">
          <p><strong>Proveedor:</strong> ${cotizacion.proveedorNombre}</p>
          <p><strong>Costo:</strong> $${cotizacion.costoProveedor?.toLocaleString('es-MX')}</p>
          <p><strong>Margen:</strong> ${cotizacion.margenGananciaPct}%</p>
          <p><strong>Precio Venta:</strong> $${cotizacion.precioVenta?.toLocaleString('es-MX')}</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ver Detalles',
      cancelButtonText: 'Cerrar',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/cotizaciones/${cotizacion.id}`);
      }
    });
  };

  if (!solicitudId) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar rol={rol} />
      <div className="dashboard-content">
        <Header nombre={nombre} rol={rol} />

        <div className="subheader">
          <div className="subheader-left">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/cotizaciones')}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver
            </button>
            <h2 className="page-title-subheader">Comparación de Cotizaciones</h2>
          </div>
        </div>

        <main className="main-panel">
          <ComparadorCotizaciones
            solicitudId={parseInt(solicitudId)}
            onSeleccionar={handleSeleccionarCotizacion}
          />
        </main>

        <Footer />
      </div>
    </div>
  );
}