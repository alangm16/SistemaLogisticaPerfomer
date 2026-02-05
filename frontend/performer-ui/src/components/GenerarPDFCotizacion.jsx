// src/components/GenerarPDFCotizacion.jsx
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import '../styles/generales.css';

export default function GenerarPDFCotizacion({ cotizacion }) {
  const [generando, setGenerando] = useState(false);

  const datosPerformer = {
    nombre: "Performer Logistics S.A. DE C.V",
    direccion: "Col. Fraccionamiento Palmas San Isidro",
    codigoPostal: "27014 Torreón, COAH",
    pais: "México"
  };

  const formatValue = (value) => (value === null || value === undefined || value === '') ? '--' : value;

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { console.log(e); return '--'; }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '--';
    return `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  const generarPDF = async () => {
    setGenerando(true);
    try {
      const { solicitud, proveedor } = cotizacion;
      const cliente = solicitud?.cliente;

      const contenedorPDF = document.createElement('div');
      // Estructura Flexbox para forzar el footer al final de la página A4
      contenedorPDF.style.cssText = `
        position: absolute; 
        left: -9999px; 
        width: 210mm; 
        min-height: 297mm; 
        padding: 15mm; 
        background: white; 
        font-family: 'Helvetica', 'Arial', sans-serif; 
        color: black; 
        display: flex; 
        flex-direction: column; 
        justify-content: space-between; 
        box-sizing: border-box;
      `;

      // Contenido Superior (Logo, Contactos, Tablas)
      const cuerpoSuperior = `
        <div style="width: 100%;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
            <div>
              <h1 style="margin: 0; font-size: 26px; font-weight: bold; letter-spacing: -1px;">PERFORMER LOGISTICS</h1>
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">Cotización ${formatValue(cotizacion.tipoTransporte)}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">${solicitud?.folioCodigo || `ID-${cotizacion.id}`}</h2>
              <p style="margin: 0; font-size: 11px;">Emisión: ${formatDate(solicitud?.fechaEmision)}</p>
              <p style="margin: 0; font-size: 11px;">Vence: ${formatDate(cotizacion.validoHasta)}</p>
            </div>
          </div>

          <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h4 style="border-bottom: 1px solid black; font-size: 12px; margin-bottom: 8px; padding-bottom: 3px;">CLIENTE</h4>
              <p style="margin: 2px 0; font-weight: bold; font-size: 13px;">${formatValue(cliente?.nombre)}</p>
              <p style="margin: 2px 0; font-size: 11px;">RFC: ${formatValue(cliente?.rfc)}</p>
              <p style="margin: 2px 0; font-size: 11px;">${formatValue(cliente?.direccion)}</p>
              <p style="margin: 2px 0; font-size: 11px;">${formatValue(cliente?.ciudad)}, ${formatValue(cliente?.pais)}</p>
              <p style="margin: 2px 0; font-size: 11px;">Email: ${formatValue(cliente?.email)}</p>
            </div>
            <div style="flex: 1;">
              <h4 style="border-bottom: 1px solid black; font-size: 12px; margin-bottom: 8px; padding-bottom: 3px;">PROVEEDOR</h4>
              <p style="margin: 2px 0; font-weight: bold; font-size: 13px;">${formatValue(proveedor?.nombre)}</p>
              <p style="margin: 2px 0; font-size: 11px;">Email: ${formatValue(proveedor?.email)}</p>
              <p style="margin: 2px 0; font-size: 11px;">Tel: ${formatValue(proveedor?.telefono)}</p>
              <p style="margin: 2px 0; font-size: 11px;">Ubicación: ${formatValue(proveedor?.ciudad)}, ${formatValue(proveedor?.pais)}</p>
            </div>
          </div>

          <div style="display: flex; background: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 25px; gap: 15px; border: 1px solid #000;">
            <div style="flex: 1; border-right: 1px solid #000; padding-right: 10px;">
              <span style="font-size: 9px; display: block; font-weight: bold;">CANTIDAD / EMPAQUE</span>
              <span style="font-size: 12px;">${formatValue(solicitud?.cantidad)} - ${formatValue(solicitud?.tipoEmpaque)}</span>
            </div>
            <div style="flex: 1; border-right: 1px solid #000; padding-right: 10px;">
              <span style="font-size: 9px; display: block; font-weight: bold;">PESO TOTAL</span>
              <span style="font-size: 12px;">${formatValue(solicitud?.pesoKg)} kg</span>
            </div>
            <div style="flex: 1; border-right: 1px solid #000; padding-right: 10px;">
              <span style="font-size: 9px; display: block; font-weight: bold;">MEDIDAS (LxAnxAl)</span>
              <span style="font-size: 12px;">${formatValue(solicitud?.largoCm)}x${formatValue(solicitud?.anchoCm)}x${formatValue(solicitud?.altoCm)} cm</span>
            </div>
            <div style="flex: 1;">
              <span style="font-size: 9px; display: block; font-weight: bold;">VALOR CARGA</span>
              <span style="font-size: 12px;">${formatCurrency(solicitud?.valorDeclaradoUsd)}</span>
            </div>
          </div>

          <h4 style="font-size: 12px; margin: 0 0 10px 0;">DETALLES DE LA SOLICITUD (RUTA)</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px;">
            <thead>
              <tr style="background: black; color: white;">
                <th style="padding: 8px; text-align: left; border: 1px solid black;">Punto</th>
                <th style="padding: 8px; text-align: left; border: 1px solid black;">País / Ciudad</th>
                <th style="padding: 8px; text-align: left; border: 1px solid black;">Dirección / CP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid black; font-weight: bold;">ORIGEN</td>
                <td style="padding: 8px; border: 1px solid black;">${formatValue(solicitud?.origenPais)} / ${formatValue(solicitud?.origenCiudad)}</td>
                <td style="padding: 8px; border: 1px solid black;">${formatValue(solicitud?.origenDireccion)} - ${formatValue(solicitud?.origenCp)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid black; font-weight: bold;">DESTINO</td>
                <td style="padding: 8px; border: 1px solid black;">${formatValue(solicitud?.destinoPais)} / ${formatValue(solicitud?.destinoCiudad)}</td>
                <td style="padding: 8px; border: 1px solid black;">${formatValue(solicitud?.destinoDireccion)} - ${formatValue(solicitud?.destinoCp)}</td>
              </tr>
            </tbody>
          </table>

          <h4 style="font-size: 12px; margin: 0 0 10px 0;">DETALLES DE LA COTIZACIÓN</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px;">
            <tr style="border-bottom: 1px solid black;">
              <td style="padding: 8px 0;"><strong>Tipo de Unidad:</strong> ${formatValue(cotizacion.tipoUnidad)}</td>
              <td style="padding: 8px 0; text-align: right;"><strong>Tiempo Estimado:</strong> ${formatValue(cotizacion.tiempoEstimado)}</td>
            </tr>
            <tr style="border-bottom: 1px solid black;">
              <td style="padding: 8px 0;"><strong>Días de Crédito:</strong> ${formatValue(cotizacion.diasCredito)}</td>
              <td style="padding: 8px 0; text-align: right;"><strong>Margen:</strong> ${formatValue(cotizacion.margenGananciaPct)}%</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 20px 0; text-align: right;">
                <span style="font-size: 14px;">COSTO TOTAL DEL SERVICIO:</span><br/>
                <span style="font-size: 24px; font-weight: bold;">${formatCurrency(cotizacion.costo)}</span>
              </td>
            </tr>
          </table>

          <div style="border-top: 1px solid black; padding-top: 15px; margin-bottom: 20px;">
            <h4 style="font-size: 12px; margin: 0 0 10px 0;">DETALLES DE SEGUIMIENTO</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
              <div><strong>Folio Cotización:</strong> ${formatValue(cotizacion.id)}</div>
              <div><strong>Folio Solicitud:</strong> ${formatValue(solicitud?.id)}</div>
              <div><strong>Estado Actual:</strong> ${formatValue(cotizacion.estado)}</div>
              <div><strong>Apilable:</strong> ${solicitud?.apilable ? 'SÍ' : 'NO'}</div>
              <div><strong>Material Peligroso:</strong> ${solicitud?.materialPeligroso ? 'SÍ' : 'NO'}</div>
            </div>
          </div>
        </div>
      `;

      // Pie de Página (Al final del contenedor flex)
      const pieDePagina = `
        <div style="text-align: center; font-size: 10px; border-top: 1px solid black; padding-top: 15px; width: 100%;">
          <p style="margin: 2px 0; font-weight: bold;">${datosPerformer.nombre}</p>
          <p style="margin: 2px 0;">${datosPerformer.direccion} | CP: ${datosPerformer.codigoPostal} | ${datosPerformer.pais}</p>
          <p style="margin: 10px 0 0 0; color: #666;">Documento generado el ${new Date().toLocaleString('es-MX')}</p>
        </div>
      `;

      contenedorPDF.innerHTML = cuerpoSuperior + pieDePagina;
      document.body.appendChild(contenedorPDF);

      // Tiempo para renderizado
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(contenedorPDF, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const nombreArchivo = `Cotizacion_${solicitud?.folioCodigo || cotizacion.id}.pdf`;
      pdf.save(nombreArchivo);

      document.body.removeChild(contenedorPDF);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el PDF.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <button 
      onClick={generarPDF} 
      disabled={generando}
      className="btn btn-secondary"
    >
      <i className={`fas ${generando ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
      {generando ? 'Generando PDF...' : 'Generar PDF'}
    </button>
  );
}