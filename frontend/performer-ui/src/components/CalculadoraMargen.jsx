// src/components/CalculadoraMargen.jsx
import { useState } from 'react';
import { api } from '../services/api';
import FormField from './FormField';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import '../styles/calculadora-margen.css';

export default function CalculadoraMargen({ solicitudId, onAplicar }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    costoProveedor: '',
    costosAdicionales: '',
    margenDeseadoPct: '15' // 15% por defecto
  });
  const [resultado, setResultado] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calcular = async () => {
    // Validar campos obligatorios
    if (!formData.costoProveedor || parseFloat(formData.costoProveedor) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes ingresar un costo de proveedor válido',
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        costoProveedor: formData.costoProveedor,
        ...(formData.costosAdicionales && { costosAdicionales: formData.costosAdicionales }),
        ...(formData.margenDeseadoPct && { margenDeseadoPct: formData.margenDeseadoPct }),
        ...(solicitudId && { solicitudId: solicitudId })
      });

      const response = await api.post(`/cotizaciones/calcular-margen?${params}`);
      setResultado(response.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo calcular el margen',
      });
    } finally {
      setLoading(false);
    }
  };

  const aplicarResultado = () => {
    if (!resultado) return;
    
    if (onAplicar) {
      onAplicar({
        costo: resultado.costoTotal,
        margen: resultado.margenDeseadoPct,
        precioVenta: resultado.precioVentaSugerido
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'Aplicado',
      text: 'Los valores se han aplicado al formulario',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const limpiar = () => {
    setFormData({
      costoProveedor: '',
      costosAdicionales: '',
      margenDeseadoPct: '15'
    });
    setResultado(null);
  };

  // Componentes internos
  const MetricCard = ({ label, value, icon, type = 'default', subtitle }) => (
    <div className={`metric-card metric-card-${type}`}>
      <div className="metric-header">
        <i className={`fa-solid ${icon}`}></i>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );

  const AlertBox = ({ type, message }) => (
    <div className={`alert-box alert-${type}`}>
      <i className={`fa-solid ${type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
      <span>{message}</span>
    </div>
  );

  return (
    <div className="calculadora-margen">
      <div className="calculadora-header">
        <h3>
          <i className="fa-solid fa-calculator"></i>
          Calculadora de Márgenes
        </h3>
        <p className="calculadora-subtitle">
          Calcula automáticamente el precio de venta según tu margen deseado
        </p>
      </div>

      {/* Formulario de entrada */}
      <div className="calculadora-form">
        <div className="form-grid">
          <FormField
            type="number"
            label="Costo del Proveedor (USD) *"
            name="costoProveedor"
            value={formData.costoProveedor}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            icon="fa-dollar-sign"
          />
          
          <FormField
            type="number"
            label="Costos Adicionales (USD)"
            name="costosAdicionales"
            value={formData.costosAdicionales}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            icon="fa-plus"
          />
          
          <FormField
            type="number"
            label="Margen Deseado (%)"
            name="margenDeseadoPct"
            value={formData.margenDeseadoPct}
            onChange={handleInputChange}
            placeholder="15"
            step="0.01"
            min="0"
            max="100"
            icon="fa-percent"
          />
        </div>

        <div className="calculadora-actions">
          <button 
            className="btn btn-secondary" 
            onClick={limpiar}
            disabled={loading}
          >
            <i className="fa-solid fa-eraser"></i>
            Limpiar
          </button>
          <button 
            className="btn btn-primary btn-large" 
            onClick={calcular}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Calculando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-calculator"></i>
                Calcular
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="calculadora-resultados">
          <div className="resultados-header">
            <h4>Resultados del Cálculo</h4>
          </div>

          {/* Métricas principales */}
          <div className="metricas-grid">
            <MetricCard
              label="Costo Total"
              value={`$${resultado.costoTotal?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              icon="fa-file-invoice-dollar"
              type="info"
              subtitle={`Proveedor: $${resultado.costoProveedor?.toLocaleString('es-MX')} + Adicionales: $${(resultado.costosAdicionales || 0)?.toLocaleString('es-MX')}`}
            />

            <MetricCard
              label="Precio Venta Sugerido"
              value={`$${resultado.precioVentaSugerido?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              icon="fa-tag"
              type="success"
              subtitle={`Con margen del ${resultado.margenDeseadoPct}%`}
            />

            <MetricCard
              label="Utilidad Estimada"
              value={`$${resultado.utilidadEstimada?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              icon="fa-chart-line"
              type="primary"
              subtitle={`ROI: ${resultado.roi?.toFixed(2)}%`}
            />

            <MetricCard
              label="Precio Venta Mínimo"
              value={`$${resultado.precioVentaMinimo?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              icon="fa-exclamation-triangle"
              type="warning"
              subtitle={`Con margen mínimo del ${resultado.margenMinimoPct}%`}
            />
          </div>

          {/* Análisis de mercado */}
          {resultado.precioMercadoPromedio > 0 && (
            <div className="analisis-mercado">
              <h5>
                <i className="fa-solid fa-chart-bar"></i>
                Análisis de Mercado
              </h5>
              <div className="mercado-stats">
                <div className="stat-item">
                  <span className="stat-label">Precio Promedio:</span>
                  <span className="stat-value">${resultado.precioMercadoPromedio?.toLocaleString('es-MX')}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Rango:</span>
                  <span className="stat-value">
                    ${resultado.precioMercadoMinimo?.toLocaleString('es-MX')} - 
                    ${resultado.precioMercadoMaximo?.toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tu Posición:</span>
                  <span className={`stat-value badge badge-${
                    resultado.posicionMercado === 'EN RANGO' ? 'success' :
                    resultado.posicionMercado === 'POR DEBAJO' ? 'info' : 'warning'
                  }`}>
                    {resultado.posicionMercado}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recomendaciones y alertas */}
          <div className="recomendaciones">
            {resultado.recomendacion && (
              <div className="recomendacion-box">
                <i className="fa-solid fa-lightbulb"></i>
                <div>
                  <strong>Recomendación:</strong>
                  <p>{resultado.recomendacion}</p>
                </div>
              </div>
            )}

            {resultado.alertas && (
              <AlertBox type="warning" message={resultado.alertas} />
            )}
          </div>

          {/* Botón para aplicar */}
          {onAplicar && (
            <div className="aplicar-resultado">
              <button 
                className="btn btn-primary btn-large" 
                onClick={aplicarResultado}
              >
                <i className="fa-solid fa-check"></i>
                Aplicar al Formulario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

CalculadoraMargen.propTypes = {
  solicitudId: PropTypes.number,
  onAplicar: PropTypes.func
};