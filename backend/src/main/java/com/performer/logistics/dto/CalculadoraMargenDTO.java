package com.performer.logistics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculadoraMargenDTO {
    
    // Inputs (costos)
    private Double costoProveedor;
    private Double costosAdicionales;    // Seguros, maniobras, etc.
    private Double costoTotal;
    
    // Configuración de margen
    private Double margenDeseadoPct;     // Porcentaje deseado
    private Double margenMinimoPct;      // Porcentaje mínimo aceptable
    
    // Outputs (cálculos)
    private Double precioVentaSugerido;
    private Double precioVentaMinimo;
    private Double utilidadEstimada;
    private Double utilidadMinima;
    
    // Análisis de competitividad
    private Double precioMercadoPromedio;
    private Double precioMercadoMinimo;
    private Double precioMercadoMaximo;
    private String posicionMercado;       // "POR DEBAJO", "EN RANGO", "POR ENCIMA"
    
    // Recomendaciones
    private String recomendacion;
    private String alertas;
    
    // Métrica ROI
    private Double roi;                   // Return on Investment
    
    // Información adicional
    private Integer diasPagoProveedor;
    private Integer diasCobroCliente;
    private Double impactoFlujoCaja;      // Diferencia en días de flujo de caja

    public Double getCostoProveedor() {
        return costoProveedor;
    }

    public void setCostoProveedor(Double costoProveedor) {
        this.costoProveedor = costoProveedor;
    }

    public Double getCostosAdicionales() {
        return costosAdicionales;
    }

    public void setCostosAdicionales(Double costosAdicionales) {
        this.costosAdicionales = costosAdicionales;
    }

    public Double getCostoTotal() {
        return costoTotal;
    }

    public void setCostoTotal(Double costoTotal) {
        this.costoTotal = costoTotal;
    }

    public Double getMargenDeseadoPct() {
        return margenDeseadoPct;
    }

    public void setMargenDeseadoPct(Double margenDeseadoPct) {
        this.margenDeseadoPct = margenDeseadoPct;
    }

    public Double getMargenMinimoPct() {
        return margenMinimoPct;
    }

    public void setMargenMinimoPct(Double margenMinimoPct) {
        this.margenMinimoPct = margenMinimoPct;
    }

    public Double getPrecioVentaSugerido() {
        return precioVentaSugerido;
    }

    public void setPrecioVentaSugerido(Double precioVentaSugerido) {
        this.precioVentaSugerido = precioVentaSugerido;
    }

    public Double getPrecioVentaMinimo() {
        return precioVentaMinimo;
    }

    public void setPrecioVentaMinimo(Double precioVentaMinimo) {
        this.precioVentaMinimo = precioVentaMinimo;
    }

    public Double getUtilidadEstimada() {
        return utilidadEstimada;
    }

    public void setUtilidadEstimada(Double utilidadEstimada) {
        this.utilidadEstimada = utilidadEstimada;
    }

    public Double getUtilidadMinima() {
        return utilidadMinima;
    }

    public void setUtilidadMinima(Double utilidadMinima) {
        this.utilidadMinima = utilidadMinima;
    }

    public Double getPrecioMercadoPromedio() {
        return precioMercadoPromedio;
    }

    public void setPrecioMercadoPromedio(Double precioMercadoPromedio) {
        this.precioMercadoPromedio = precioMercadoPromedio;
    }

    public Double getPrecioMercadoMinimo() {
        return precioMercadoMinimo;
    }

    public void setPrecioMercadoMinimo(Double precioMercadoMinimo) {
        this.precioMercadoMinimo = precioMercadoMinimo;
    }

    public Double getPrecioMercadoMaximo() {
        return precioMercadoMaximo;
    }

    public void setPrecioMercadoMaximo(Double precioMercadoMaximo) {
        this.precioMercadoMaximo = precioMercadoMaximo;
    }

    public String getPosicionMercado() {
        return posicionMercado;
    }

    public void setPosicionMercado(String posicionMercado) {
        this.posicionMercado = posicionMercado;
    }

    public String getRecomendacion() {
        return recomendacion;
    }

    public void setRecomendacion(String recomendacion) {
        this.recomendacion = recomendacion;
    }

    public String getAlertas() {
        return alertas;
    }

    public void setAlertas(String alertas) {
        this.alertas = alertas;
    }

    public Double getRoi() {
        return roi;
    }

    public void setRoi(Double roi) {
        this.roi = roi;
    }

    public Integer getDiasPagoProveedor() {
        return diasPagoProveedor;
    }

    public void setDiasPagoProveedor(Integer diasPagoProveedor) {
        this.diasPagoProveedor = diasPagoProveedor;
    }

    public Integer getDiasCobroCliente() {
        return diasCobroCliente;
    }

    public void setDiasCobroCliente(Integer diasCobroCliente) {
        this.diasCobroCliente = diasCobroCliente;
    }

    public Double getImpactoFlujoCaja() {
        return impactoFlujoCaja;
    }

    public void setImpactoFlujoCaja(Double impactoFlujoCaja) {
        this.impactoFlujoCaja = impactoFlujoCaja;
    }
}