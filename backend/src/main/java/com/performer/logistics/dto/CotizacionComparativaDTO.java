package com.performer.logistics.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionComparativaDTO {
    
    // Identificación
    private Long id;
    private String folioCodigo;
    
    // Proveedor
    private String proveedorNombre;
    private String proveedorPais;
    
    // Transporte
    private String tipoTransporte;
    private String origen;
    private String destino;
    private String tipoUnidad;
    private String tiempoEstimado;
    
    // Financiero
    private Double costoProveedor;
    private Double margenGananciaPct;
    private Double precioVenta;
    private Double utilidadEstimada;
    private Integer diasCredito;
    private LocalDate validoHasta;
    
    // Métricas calculadas
    private Double costoPorKm;           // Si se calcula distancia
    private Double roi;                  // Return on Investment (%)
    private Integer diasVigenciaRestantes;
    private String estadoVigencia;       // "VIGENTE", "PRÓXIMO A VENCER", "VENCIDO"
    
    // Indicadores de competitividad
    private String nivelCompetitividad;  // "MUY COMPETITIVO", "COMPETITIVO", "POCO COMPETITIVO"
    private Integer rankingPorCosto;     // 1 = más barato
    private Integer rankingPorMargen;    // 1 = mejor margen
    
    // Estado
    private String estado;
    
    // Extras
    private Boolean tieneDescuentoVolumen;
    private Boolean proveedorPreferido;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFolioCodigo() {
        return folioCodigo;
    }

    public void setFolioCodigo(String folioCodigo) {
        this.folioCodigo = folioCodigo;
    }

    public String getProveedorNombre() {
        return proveedorNombre;
    }

    public void setProveedorNombre(String proveedorNombre) {
        this.proveedorNombre = proveedorNombre;
    }

    public String getProveedorPais() {
        return proveedorPais;
    }

    public void setProveedorPais(String proveedorPais) {
        this.proveedorPais = proveedorPais;
    }

    public String getTipoTransporte() {
        return tipoTransporte;
    }

    public void setTipoTransporte(String tipoTransporte) {
        this.tipoTransporte = tipoTransporte;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getTipoUnidad() {
        return tipoUnidad;
    }

    public void setTipoUnidad(String tipoUnidad) {
        this.tipoUnidad = tipoUnidad;
    }

    public String getTiempoEstimado() {
        return tiempoEstimado;
    }

    public void setTiempoEstimado(String tiempoEstimado) {
        this.tiempoEstimado = tiempoEstimado;
    }

    public Double getCostoProveedor() {
        return costoProveedor;
    }

    public void setCostoProveedor(Double costoProveedor) {
        this.costoProveedor = costoProveedor;
    }

    public Double getMargenGananciaPct() {
        return margenGananciaPct;
    }

    public void setMargenGananciaPct(Double margenGananciaPct) {
        this.margenGananciaPct = margenGananciaPct;
    }

    public Double getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(Double precioVenta) {
        this.precioVenta = precioVenta;
    }

    public Double getUtilidadEstimada() {
        return utilidadEstimada;
    }

    public void setUtilidadEstimada(Double utilidadEstimada) {
        this.utilidadEstimada = utilidadEstimada;
    }

    public Integer getDiasCredito() {
        return diasCredito;
    }

    public void setDiasCredito(Integer diasCredito) {
        this.diasCredito = diasCredito;
    }

    public LocalDate getValidoHasta() {
        return validoHasta;
    }

    public void setValidoHasta(LocalDate validoHasta) {
        this.validoHasta = validoHasta;
    }

    public Double getCostoPorKm() {
        return costoPorKm;
    }

    public void setCostoPorKm(Double costoPorKm) {
        this.costoPorKm = costoPorKm;
    }

    public Double getRoi() {
        return roi;
    }

    public void setRoi(Double roi) {
        this.roi = roi;
    }

    public Integer getDiasVigenciaRestantes() {
        return diasVigenciaRestantes;
    }

    public void setDiasVigenciaRestantes(Integer diasVigenciaRestantes) {
        this.diasVigenciaRestantes = diasVigenciaRestantes;
    }

    public String getEstadoVigencia() {
        return estadoVigencia;
    }

    public void setEstadoVigencia(String estadoVigencia) {
        this.estadoVigencia = estadoVigencia;
    }

    public String getNivelCompetitividad() {
        return nivelCompetitividad;
    }

    public void setNivelCompetitividad(String nivelCompetitividad) {
        this.nivelCompetitividad = nivelCompetitividad;
    }

    public Integer getRankingPorCosto() {
        return rankingPorCosto;
    }

    public void setRankingPorCosto(Integer rankingPorCosto) {
        this.rankingPorCosto = rankingPorCosto;
    }

    public Integer getRankingPorMargen() {
        return rankingPorMargen;
    }

    public void setRankingPorMargen(Integer rankingPorMargen) {
        this.rankingPorMargen = rankingPorMargen;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Boolean getTieneDescuentoVolumen() {
        return tieneDescuentoVolumen;
    }

    public void setTieneDescuentoVolumen(Boolean tieneDescuentoVolumen) {
        this.tieneDescuentoVolumen = tieneDescuentoVolumen;
    }

    public Boolean getProveedorPreferido() {
        return proveedorPreferido;
    }

    public void setProveedorPreferido(Boolean proveedorPreferido) {
        this.proveedorPreferido = proveedorPreferido;
    }
    
    
}
